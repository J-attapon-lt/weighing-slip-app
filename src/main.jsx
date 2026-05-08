import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Printer, RotateCcw, Copy, Plus, Minus } from 'lucide-react';
import './styles.css';

const FIXED = {
  customer: 'สหกรณ์กองทุนสวนยางพาราทองผาภูมิ จำกัด',
  product: 'ยางแผ่นดิบ',
  company: 'บริษัท แอล.ที. การยาง จำกัด',
  address: '541 ม.3 จันดี ฉวาง นครศรีธรรมราช - 80250 โทร 075-445-930 เลขประจำตัวผู้เสียภาษี 0805523000071',
};

function pad(num) { return String(num).padStart(2, '0'); }

function thaiDateTimeNow() {
  const d = new Date();
  const buddhistYear = d.getFullYear() + 543;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${buddhistYear} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function createSlip(index) {
  const d = new Date();
  return {
    id: index + 1,
    slipNo: `LTR${d.getFullYear().toString().slice(-2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(index + 1)}`,
    scaleStaff: '',
    vehicleType: 'เทรนเลอร์',
    price: '0.00',
    note: '',
    dateTime: thaiDateTimeNow(),
    carPlate: '',
    inDate: '',
    inTime: '',
    inWeight: '',
    outDate: '',
    outTime: '',
    outWeight: '',
    moisture: '0',
    deduction: '0.00',
  };
}

function numberValue(value) { return Number(String(value || '').replace(/,/g, '')) || 0; }
function formatNumber(value) {
  const n = numberValue(value);
  return n ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '';
}
function money(value) {
  const n = Number(String(value || '').replace(/,/g, ''));
  return Number.isFinite(n) ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
}

function Button({ children, variant = 'primary', icon: Icon, ...props }) {
  return <button className={`btn ${variant}`} {...props}>{Icon && <Icon size={16} />} {children}</button>;
}

function Field({ label, value, onChange, placeholder = '' }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

function SlipPreview({ slip }) {
  const inWeight = numberValue(slip.inWeight);
  const outWeight = numberValue(slip.outWeight);
  const net = Math.abs(outWeight - inWeight);
  const moisture = numberValue(slip.moisture);
  const remain = Math.max(net - moisture, 0);
  const amount = 0;
  const deduction = numberValue(slip.deduction);
  const balance = Math.max(amount - deduction, 0);

  return <section className="print-page">
    <div className="paper">
      <div className="top-row">
        <div className="slip-no">เลขที่ใบชั่ง {slip.slipNo}</div>
        <div className="title">ใบชั่งน้ำหนัก</div>
        <div className="top-spacer" />
      </div>

      <div className="header-grid">
        <div className="header-left">
          <div>ชื่อลูกค้า&nbsp;&nbsp;{FIXED.customer}</div>
          <div>สินค้า&nbsp;&nbsp;{FIXED.product}</div>
          <div>ประเภทรถ&nbsp;&nbsp;{slip.vehicleType}</div>
          <div>ราคา</div>
          <div>หมายเหตุ&nbsp;&nbsp;{slip.note}</div>
        </div>
        <div className="header-right">
          <div>พนักงานชั่ง&nbsp;&nbsp;{slip.scaleStaff}</div>
          <div className="price-line">{money(slip.price)} บาท</div>
          <div className="date-line">วันที่&nbsp;&nbsp;{slip.dateTime}</div>
        </div>
      </div>

      <table className="weight-table">
        <thead><tr><th>รายการ</th><th>ทะเบียนรถ</th><th>วันที่</th><th>เวลา</th><th className="right">น้ำหนัก</th></tr></thead>
        <tbody>
          <tr><td>เข้า</td><td>{slip.carPlate}</td><td>{slip.inDate}</td><td>{slip.inTime}</td><td className="right">{formatNumber(slip.inWeight)}</td></tr>
          <tr><td>ออก</td><td>{slip.carPlate}</td><td>{slip.outDate}</td><td>{slip.outTime}</td><td className="right">{formatNumber(slip.outWeight)}</td></tr>
        </tbody>
      </table>

      <div className="summary-wrap">
        <div />
        <div className="summary">
          <div><span>นน. สุทธิ</span><span>{formatNumber(net)}</span></div>
          <div><span>ความชื้น/สิ่งเจือปน</span><span>{formatNumber(moisture)}</span></div>
          <div><span>นน. คงเหลือ</span><span>{formatNumber(remain)}</span></div>
          <div><span>จำนวนเงิน</span><span>{money(amount)}</span></div>
          <div><span>เงินหัก</span><span>{money(deduction)}</span></div>
        </div>
      </div>

      <div className="sign-row"><div>พนักงานชั่ง</div><div>พนักงานขับรถ</div><div className="balance">เงินคงเหลือ&nbsp;&nbsp;{money(balance)}</div></div>
      <div className="address">{FIXED.address}</div>
      <div className="company">{FIXED.company}</div>
    </div>
  </section>;
}

function App() {
  const [slips, setSlips] = useState(() => Array.from({ length: 9 }, (_, i) => createSlip(i)));
  const [selected, setSelected] = useState(0);
  const slip = slips[selected];
  const update = (key, value) => setSlips((prev) => prev.map((item, i) => i === selected ? { ...item, [key]: value } : item));

  const copyFirstToAll = () => {
    const base = slips[0];
    setSlips((prev) => prev.map((item, i) => i === 0 ? item : { ...item, scaleStaff: base.scaleStaff, vehicleType: base.vehicleType, price: base.price, note: base.note, carPlate: base.carPlate, inDate: base.inDate, outDate: base.outDate, moisture: base.moisture, deduction: base.deduction }));
  };
  const resetAll = () => { setSlips(Array.from({ length: 9 }, (_, i) => createSlip(i))); setSelected(0); };
  const addSlip = () => setSlips((prev) => [...prev, createSlip(prev.length)]);
  const removeSlip = () => { if (slips.length <= 1) return; setSlips((prev) => prev.slice(0, -1)); setSelected((s) => Math.min(s, slips.length - 2)); };
  const totalNet = useMemo(() => slips.reduce((sum, item) => sum + Math.abs(numberValue(item.outWeight) - numberValue(item.inWeight)), 0), [slips]);

  return <div className="app">
    <div className="no-print container">
      <div className="toolbar">
        <div><h1>เว็บแอปสร้างใบชั่งน้ำหนัก</h1><p>สร้างและพิมพ์ใบชั่งน้ำหนัก {slips.length} ใบ พร้อมข้อมูลคงที่ของบริษัทและสินค้า</p></div>
        <div className="actions"><Button icon={Printer} onClick={() => window.print()}>พิมพ์ / Save PDF</Button><Button variant="secondary" icon={Copy} onClick={copyFirstToAll}>คัดลอกใบที่ 1</Button><Button variant="outline" icon={RotateCcw} onClick={resetAll}>ล้างข้อมูล</Button></div>
      </div>

      <div className="layout">
        <aside className="panel">
          <div className="panel-head"><div><b>เลือกใบที่ต้องการแก้ไข</b><p>นน. สุทธิรวม: {formatNumber(totalNet)} กก.</p></div><div className="small-actions"><Button variant="outline" icon={Minus} onClick={removeSlip}></Button><Button variant="outline" icon={Plus} onClick={addSlip}></Button></div></div>
          <div className="slip-tabs">{slips.map((item, i) => <button key={item.id} className={selected === i ? 'active' : ''} onClick={() => setSelected(i)}>ใบ {i + 1}</button>)}</div>
          <div className="fixed-box"><div><b>ลูกค้า:</b> {FIXED.customer}</div><div><b>สินค้า:</b> {FIXED.product}</div><div><b>บริษัท:</b> {FIXED.company}</div></div>
          <div className="form-grid">
            <Field label="เลขที่ใบชั่ง" value={slip.slipNo} onChange={(v) => update('slipNo', v)} />
            <Field label="วันที่บนหัวใบ" value={slip.dateTime} onChange={(v) => update('dateTime', v)} />
            <Field label="พนักงานชั่ง" value={slip.scaleStaff} onChange={(v) => update('scaleStaff', v)} />
            <Field label="ประเภทรถ" value={slip.vehicleType} onChange={(v) => update('vehicleType', v)} />
            <Field label="ทะเบียนรถ" value={slip.carPlate} onChange={(v) => update('carPlate', v)} placeholder="เช่น 70-4923/70-4924 นครศรีธรรมราช" />
            <div className="two"><Field label="วันที่เข้า" value={slip.inDate} onChange={(v) => update('inDate', v)} placeholder="17/05/2568" /><Field label="เวลาเข้า" value={slip.inTime} onChange={(v) => update('inTime', v)} placeholder="08:09:37" /></div>
            <Field label="น้ำหนักเข้า" value={slip.inWeight} onChange={(v) => update('inWeight', v)} placeholder="15730" />
            <div className="two"><Field label="วันที่ออก" value={slip.outDate} onChange={(v) => update('outDate', v)} placeholder="17/05/2568" /><Field label="เวลาออก" value={slip.outTime} onChange={(v) => update('outTime', v)} placeholder="14:39:30" /></div>
            <Field label="น้ำหนักออก" value={slip.outWeight} onChange={(v) => update('outWeight', v)} placeholder="48690" />
            <div className="two"><Field label="ความชื้น/สิ่งเจือปน" value={slip.moisture} onChange={(v) => update('moisture', v)} /><Field label="เงินหัก" value={slip.deduction} onChange={(v) => update('deduction', v)} /></div>
            <Field label="ราคา" value={slip.price} onChange={(v) => update('price', v)} />
            <label className="field"><span>หมายเหตุ</span><textarea value={slip.note} onChange={(e) => update('note', e.target.value)} rows="2" /></label>
          </div>
        </aside>
        <main className="preview"><div className="preview-scale"><SlipPreview slip={slip} /></div></main>
      </div>
    </div>
    <div className="print-area">{slips.map((item) => <SlipPreview key={item.id} slip={item} />)}</div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
