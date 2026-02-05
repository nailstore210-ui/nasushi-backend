const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("NASUSHI21"));

// إعداد Twilio (يتفعل فقط إذا المتغيرات موجودة)
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// 🏠 Route رئيسي
app.get("/", (req, res) => {
  res.send("✅ Nasushi Backend is running!");
});

// 🗂️ دوال العملاء
function readCustomers() {
  if (!fs.existsSync("customers.json")) return {};
  return JSON.parse(fs.readFileSync("customers.json", "utf8"));
}
function writeCustomers(customers) {
  fs.writeFileSync("customers.json", JSON.stringify(customers, null, 2), "utf8");
}

// ✅ Route لطلبية جديدة
app.post("/order", async (req, res) => {
  try {
    const order = req.body;
    const orderId = "ORD-" + Date.now();
    order.id = orderId;

    // 🪙 النقاط
    const usedPoints = Number(order.usedPoints) || 0;
    let customers = readCustomers();
    const customerKey = order.phone;

    if (!customers[customerKey]) {
      customers[customerKey] = { name: order.name, phone: order.phone, points: 0 };
    }

    let currentPoints = customers[customerKey].points;
    if (currentPoints >= usedPoints) {
      currentPoints -= usedPoints;
    } else {
      return res.send({ status: "error", message: "رصيد النقاط غير كافي" });
    }

    let earnedPoints = 0;
    if (usedPoints === 0) {
      earnedPoints = Math.floor(Number(order.total) / 100);
      currentPoints += earnedPoints;
    }

    customers[customerKey].points = currentPoints;
    order.pointsEarned = earnedPoints;
    order.pointsUsed = usedPoints;
    order.pointsBalance = currentPoints;

    // 🗂️ تخزين الطلبية
    fs.appendFileSync("orders.txt", JSON.stringify(order) + "\n", "utf8");
    writeCustomers(customers);

    // 📲 إرسال واتساب إذا Twilio موجود
    if (client) {
      try {
        await client.messages.create({
          from: "whatsapp:+14155238886",
          to: "whatsapp:+213792106084",
          body: `طلب جديد 🛒 رقم الطلب: ${order.id}\n👤 الاسم: ${order.name}\n📞 الهاتف: ${order.phone}\n💰 المجموع: ${order.total} DA`
        });
        console.log("✅ تم إرسال الطلب إلى واتساب");
      } catch (err) {
        console.error("❌ خطأ في إرسال واتساب:", err.message);
      }
    }

    // ✅ توليد فاتورة PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `invoice-${orderId}.pdf`);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 🖼️ شعار إذا موجود
    const logoPath = path.join(__dirname, "logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [100, 100], align: "center", valign: "top" });
    }

    doc.fontSize(20).text("فاتورة الطلبية", { align: "center" });
    doc.text(`🆔 رقم الطلب: ${orderId}`);
    doc.text(`👤 الاسم: ${order.name}`);
    doc.text(`📞 الهاتف: ${order.phone}`);
    doc.text(`📍 المنطقة: ${order.area}`);
    doc.text(`🕒 الوقت: ${order.time}`);
    doc.moveDown();

    doc.fontSize(16).text("📦 المنتجات:", { underline: true });
    order.products.forEach(p => {
      doc.text(`${p.name} : ${p.price} DA`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`💰 المجموع: ${order.total} DA`);
    doc.text(`🪙 النقاط المستعملة: ${order.pointsUsed}`);
    doc.text(`🪙 الرصيد الجديد: ${order.pointsBalance}`);

    doc.moveDown(2);
    doc.fontSize(12).text("📞 للتواصل:   07 92 10 60 84  ", { align: "center" });
    doc.text("📸 تابعنا على إنستغرام: @nasushi21", { align: "center" });
    doc.text("🌐 موقعنا: www.nasushi21.com", { align: "center" });

    doc.end();

    stream.on("finish", () => {
      res.redirect(`/invoice/${orderId}`);
    });
  } catch (err) {
    console.error("❌ خطأ في معالجة الطلبية:", err.message);
    res.status(500).send({ error: "خطأ في معالجة الطلبية" });
  }
});

// ✅ Route لعرض الفاتورة
app.get("/invoice/:id", (req, res) => {
  const filePath = path.join(__dirname, `invoice-${req.params.id}.pdf`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, { headers: { "Content-Type": "application/pdf" } });
  } else {
    res.status(404).send("❌ الفاتورة غير موجودة");
  }
});

// ✅ Route لرصيد النقاط
app.get("/points/:phone", (req, res) => {
  const customers = readCustomers();
  const phone = req.params.phone;
  res.send({ points: customers[phone] ? customers[phone].points : 0 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));