// ================================
// 📋 BlackTea POS v2.3 - tables.js
// Quản lý bàn & đơn hàng hiện tại
// ================================

// Firestore (v8)
let db = null;
if (typeof firebase !== "undefined" && firebase.firestore) {
  db = firebase.firestore();
}


// Danh sách tất cả bàn / đơn
let TABLES = [];

// Bàn hoặc đơn hiện tại đang thao tác
let currentTable = null;

// ================================
// 🔹 LOAD & SAVE dữ liệu
// ================================

// Tải dữ liệu từ Firestore hoặc local
async function loadTables() {
  const local = localStorage.getItem("BT_TABLES");
  if (local) TABLES = JSON.parse(local);

  try {
    const snapshot = await db.collection("TABLES").get();
    TABLES = snapshot.docs.map((d) => d.data());
    saveAll(); // lưu lại local backup
  } catch (err) {
    console.warn("⚠️ Không thể tải Firestore, dùng dữ liệu local.");
  }
}

// Lưu toàn bộ TABLES về Firestore + local
async function saveAll() {
  localStorage.setItem("BT_TABLES", JSON.stringify(TABLES));
  try {
    const batch = db.batch();
    TABLES.forEach((t) => {
      const ref = db.collection("TABLES").doc(String(t.id));
      batch.set(ref, t);
    });
    await batch.commit();
  } catch (err) {
    console.warn("⚠️ Không thể lưu Firestore, giữ localStorage.", err);
  }
}

// ================================
// 🔹 TẠO & CHỌN BÀN
// ================================

// Tạo bàn mới hoặc đơn mang đi
function taoBanMoi(name, type = "mangdi") {
  const don = {
    id: Date.now(),
    name: name,
    type: type,
    cart: [],
    served: false,
    createdAt: Date.now(),
    _isDraft: true
  };

  TABLES.push(don);
  currentTable = don;
  saveAll();
  return don;
}

// Mở lại bàn đã tồn tại
function moBan(id) {
  const ban = TABLES.find((t) => t.id === id);
  if (ban) currentTable = ban;
  return ban;
}

// Đóng bàn hiện tại (sau khi thanh toán hoặc hủy)
function dongBanHienTai() {
  if (!currentTable) return;
  TABLES = TABLES.filter((t) => t.id !== currentTable.id);
  currentTable = null;
  saveAll();
}

// ================================
// 🔹 TRẠNG THÁI & ĐỒNG BỘ
// ================================

// Cập nhật trạng thái bàn
function capNhatTrangThai(id, status) {
  const ban = TABLES.find((t) => t.id === id);
  if (ban) {
    ban.status = status;
    saveAll();
  }
}

// Reset toàn bộ bàn trong ngày mới
function resetBanHangNgay() {
  TABLES = [];
  currentTable = null;
  localStorage.removeItem("BT_TABLES");
  db.collection("TABLES").get().then((snap) => {
    snap.forEach((doc) => doc.ref.delete());
  });
}

// ================================
// 🔹 TIỆN ÍCH
// ================================

// Tính tổng tiền bàn hiện tại
function tongTienBan(ban) {
  if (!ban || !ban.cart) return 0;
  return ban.cart.reduce((a, m) => a + m.price * (m.soluong || 0), 0);
}

// Cập nhật giỏ hàng hiện tại và lưu
function capNhatBanHienTai() {
  if (!currentTable) return;
  saveAll();
}
