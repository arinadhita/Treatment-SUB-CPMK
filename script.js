/**
 * ==================== SIYAZoo - SCRIPT.JS ====================
 * File ini berisi semua fungsi JavaScript untuk:
 * 1. Pemesanan tiket (modal form)
 * 2. CRUD data riwayat (Create, Read, Update, Delete)
 * 3. Manipulasi DOM
 * 4. Event Handling
 * 5. LocalStorage untuk penyimpanan data
 * 
 * Penulis: SIYAZoo Team
 * Tanggal: 2026
 * =============================================================
 */

// ==================== FUNGSI FORMAT TANGGAL ====================
/**
 * Mengubah format tanggal dari YYYY-MM-DD ke format Indonesia
 * Contoh: "2026-06-15" -> "15 Juni 2026"
 * @param {string} str - Tanggal dalam format YYYY-MM-DD
 * @returns {string} Tanggal dalam format Indonesia
 */
function formatTanggal(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
}

// ==================== VARIABEL GLOBAL ====================
let layananDipilih = '';    // Menyimpan nama layanan yang dipilih
let hargaDipilih = 0;       // Menyimpan harga layanan yang dipilih
let modeEdit = false;       // Status apakah sedang mode edit (true) atau tambah baru (false)
let idEdit = '';            // Menyimpan ID pesanan yang sedang diedit

// ==================== FUNGSI CEK HALAMAN ====================
/**
 * Mengecek apakah halaman saat ini adalah halaman layanan (ada elemen modal)
 * @returns {boolean} true jika di halaman layanan, false jika di halaman lain
 */
function isLayananPage() {
  return document.getElementById('modalOverlay') !== null;
}

// ==================== FUNGSI BUKA MODAL ====================
/**
 * Membuka modal form pemesanan
 * @param {string} nama - Nama layanan yang dipilih
 * @param {number} harga - Harga layanan
 * @param {object|null} dataEdit - Data pesanan untuk mode edit (default: null)
 */
function bukaModal(nama, harga, dataEdit = null) {
  // Jika bukan di halaman layanan, redirect ke layanan.html
  if (!isLayananPage()) {
    // Simpan data edit ke localStorage untuk diproses di halaman layanan
    localStorage.setItem('edit_pending', JSON.stringify({
      nama: nama,
      harga: harga,
      data: dataEdit,
      modeEdit: true,
      idEdit: idEdit
    }));
    window.location.href = 'layanan.html';
    return;
  }
  
  // Set variabel global
  layananDipilih = nama;
  hargaDipilih = harga;
  
  // Set judul modal
  let judul = '🎟️ Pesan ' + nama;
  if (harga > 0) judul += ' — Rp ' + harga.toLocaleString('id-ID');
  document.getElementById('modalJudul').innerText = judul;
  
  // Set tanggal minimal = hari ini (tidak bisa pilih tanggal kemarin)
  const today = new Date().toISOString().split('T')[0];
  const inputTanggal = document.getElementById('inputTanggal');
  inputTanggal.min = today;
  
  // Isi form (jika mode edit, isi dengan data lama; jika tidak, reset form)
  if (dataEdit) {
    // Mode EDIT: isi form dengan data pesanan yang akan diedit
    document.getElementById('inputNama').value = dataEdit.nama;
    document.getElementById('inputEmail').value = dataEdit.email;
    document.getElementById('inputTanggal').value = dataEdit.tanggal;
    document.getElementById('inputJumlah').value = dataEdit.jumlah;
    document.getElementById('inputPembayaran').value = dataEdit.pembayaran;
  } else {
    // Mode TAMBAH BARU: reset semua field form
    document.getElementById('inputNama').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputTanggal').value = today;
    document.getElementById('inputJumlah').value = 1;
    document.getElementById('inputPembayaran').value = '';
  }
  
  // Tampilkan modal (tambah class 'aktif')
  document.getElementById('modalOverlay').classList.add('aktif');
  document.body.style.overflow = 'hidden'; // Mencegah scroll halaman saat modal terbuka
}

// ==================== FUNGSI TUTUP MODAL ====================
/**
 * Menutup modal form pemesanan dan mereset variabel edit
 */
function tutupModal() {
  if (!isLayananPage()) return;
  
  // Sembunyikan modal (hapus class 'aktif')
  document.getElementById('modalOverlay').classList.remove('aktif');
  document.body.style.overflow = ''; // Kembalikan scroll
  
  // Reset variabel mode edit
  modeEdit = false;
  idEdit = '';
}

// ==================== FUNGSI KONFIRMASI PESAN ====================
/**
 * Memproses data pemesanan (tambah baru atau update data)
 * Validasi form, simpan ke localStorage, dan redirect ke riwayat
 */
function konfirmasiPesan() {
  if (!isLayananPage()) return;
  
  // Ambil nilai dari form
  const nama = document.getElementById('inputNama').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const tanggal = document.getElementById('inputTanggal').value;
  const jumlah = parseInt(document.getElementById('inputJumlah').value);
  const bayar = document.getElementById('inputPembayaran').value;
  
  // Validasi: semua field harus diisi
  if (!nama || !email || !tanggal || !jumlah || !bayar) {
    alert('⚠️ Semua data harus diisi!');
    return;
  }
  
  // Ambil data riwayat yang sudah tersimpan di localStorage
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  if (modeEdit && idEdit) {
    // ========== MODE UPDATE DATA ==========
    // Cari data dengan ID yang sesuai lalu update
    for (let i = 0; i < riwayat.length; i++) {
      if (riwayat[i].id === idEdit) {
        riwayat[i].nama = nama;
        riwayat[i].email = email;
        riwayat[i].tanggal = tanggal;
        riwayat[i].jumlah = jumlah;
        riwayat[i].pembayaran = bayar;
        riwayat[i].total = hargaDipilih > 0 ? hargaDipilih * jumlah : null;
        break;
      }
    }
    // Simpan kembali ke localStorage
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    alert('✅ Data berhasil diupdate!');
    tutupModal();
    window.location.href = 'riwayat.html'; // Redirect ke halaman riwayat
  } else {
    // ========== MODE TAMBAH DATA BARU ==========
    // Buat ID unik untuk pesanan (format: SYZ + 6 digit terakhir timestamp)
    const idBaru = 'SYZ' + Date.now().toString().slice(-6);
    const totalHarga = hargaDipilih > 0 ? hargaDipilih * jumlah : null;
    
    // Objek data pesanan baru
    const dataBaru = {
      id: idBaru,
      layanan: layananDipilih,
      nama: nama,
      email: email,
      tanggal: tanggal,
      jumlah: jumlah,
      pembayaran: bayar,
      harga: hargaDipilih,
      total: totalHarga,
      status: 'Dikonfirmasi'
    };
    
    // Tambahkan ke awal array (paling baru di atas)
    riwayat.unshift(dataBaru);
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    tutupModal();
    alert('✅ Pemesanan berhasil!');
    window.location.href = 'riwayat.html'; // Redirect ke halaman riwayat
  }
}

// ==================== FUNGSI TAMPILKAN RIWAYAT ====================
/**
 * Membaca data dari localStorage dan menampilkannya ke dalam tabel HTML
 * Fungsi ini dipanggil saat halaman riwayat.html dimuat
 */
function tampilkanRiwayat() {
  // Ambil data dari localStorage
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  const kontainer = document.getElementById('kontenRiwayat');
  if (!kontainer) return;
  
  // Jika tidak ada data, tampilkan pesan kosong
  if (riwayat.length === 0) {
    kontainer.innerHTML = `
      <div class="riwayat-kosong">
        <div class="icon-kosong">🎟️</div>
        <p>Belum ada pemesanan. Yuk, pesan tiket kunjunganmu!</p>
        <a href="layanan.html" class="btn-ke-layanan">Lihat Layanan</a>
      </div>
    `;
    const btnHapusSemua = document.getElementById('btnHapusSemua');
    if (btnHapusSemua) btnHapusSemua.style.display = 'none';
    return;
  }
  
  // Tampilkan tombol hapus semua
  const btnHapusSemua = document.getElementById('btnHapusSemua');
  if (btnHapusSemua) btnHapusSemua.style.display = 'inline-block';
  
  // Bangun tabel HTML secara dinamis
  let html = '<p class="jumlah-pesanan">Menampilkan ' + riwayat.length + ' data pemesanan</p>';
  html += '<div class="tabel-wrapper"><table class="tabel-riwayat">';
  html += '<thead><tr>';
  html += '<th>No</th><th>Nama</th><th>Layanan</th><th>Tgl Kunjungan</th>';
  html += '<th>Jumlah</th><th>Pembayaran</th><th>Total</th><th>Status</th><th>Aksi</th>';
  html += '</tr></thead><tbody>';
  
  // Looping data riwayat untuk membuat baris tabel
  for (let i = 0; i < riwayat.length; i++) {
    const item = riwayat[i];
    const totalStr = item.total ? 'Rp ' + item.total.toLocaleString('id-ID') : 'Hubungi kami';
    
    html += '<tr>';
    html += '<td>' + (i + 1) + '</td>';
    html += '<td>' + item.nama + '</td>';
    html += '<td>' + item.layanan + '</td>';
    html += '<td>' + formatTanggal(item.tanggal) + '</td>';
    html += '<td>' + item.jumlah + '</td>';
    html += '<td>' + item.pembayaran + '</td>';
    html += '<td class="total-harga">' + totalStr + '</td>';
    html += '<td><span class="badge-status">✅ ' + item.status + '</span></td>';
    html += '<td class="aksi-column">';
    // Tombol Edit dengan data-id berisi ID pesanan
    html += '<button class="btn-edit" data-id="' + item.id + '">✏️ Edit</button>';
    // Tombol Hapus dengan data-id berisi ID pesanan
    html += '<button class="btn-hapus" data-id="' + item.id + '">🗑️ Hapus</button>';
    html += '</td>';
    html += '</tr>';
  }
  
  html += '</tbody></table></div>';
  kontainer.innerHTML = html; // Manipulasi DOM: mengisi tabel ke dalam kontainer
}

// ==================== FUNGSI HAPUS PER PESANAN ====================
/**
 * Menghapus satu pesanan berdasarkan ID
 * @param {string} id - ID pesanan yang akan dihapus
 */
function hapusPesanan(id) {
  if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
  
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  // cari index data 
  let indexHapus = -1;
  for (let i = 0; i < riwayat.length; i++) {
    if (riwayat[i].id === id) {
      indexHapus = i;
      break;
    }
  }
  
  if (indexHapus !== -1) {
    // hapus data dari array
    riwayat.splice(indexHapus, 1);
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    tampilkanRiwayat(); // Refresh tabel
  }
}

// ==================== FUNGSI HAPUS SEMUA ====================
/**
 * Menghapus semua data riwayat pemesanan
 */
function hapusSemua() {
  if (confirm('Yakin ingin menghapus SEMUA riwayat?')) {
    localStorage.removeItem('siyazoo_riwayat');
    tampilkanRiwayat(); // Refresh tabel (akan tampil pesan kosong)
  }
}

// ==================== FUNGSI EDIT PESANAN ====================
/**
 * Menyiapkan data untuk mode edit dan membuka modal
 * @param {string} id - ID pesanan yang akan diedit
 */
function editPesanan(id) {
  // Mencari data berdasarkan ID
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  // cari data dengan ID yang sesuai
  let data = null;
  for (let i = 0; i < riwayat.length; i++) {
    if (riwayat[i].id === id) {
      data = riwayat[i];
      break;
    }
  }
  
  // set varianel mode edit
  if (data) {
    modeEdit = true;
    idEdit = id;
    layananDipilih = data.layanan;
    hargaDipilih = data.harga;
    // buka modal dengan data pesanan yang akan diedit
    bukaModal(data.layanan, data.harga, data);
  }
}

// ==================== FUNGSI CEK PENDING EDIT ====================
/**
 * Memeriksa apakah ada data edit yang pending (dari halaman riwayat)
 * Jika ada, buka modal dengan data tersebut
 */
function cekPendingEdit() {
  const pending = localStorage.getItem('edit_pending');
  if (pending) {
    localStorage.removeItem('edit_pending');
    const data = JSON.parse(pending);
    modeEdit = data.modeEdit;
    idEdit = data.idEdit;
    layananDipilih = data.nama;
    hargaDipilih = data.harga;
    // Delay sedikit untuk memastikan DOM sudah siap
    setTimeout(function() {
      bukaModal(data.nama, data.harga, data.data);
    }, 100);
  }
}

// ==================== EVENT LISTENER ====================
/**
 * Event listener yang dijalankan setelah DOM selesai dimuat
 * Mengatur berbagai event handler dan inisialisasi halaman
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM siap');
  
  // Jika di halaman layanan, cek pending edit dan setup modal
  if (isLayananPage()) {
    cekPendingEdit(); // Cek apakah ada data edit dari riwayat
    
    // Event untuk menutup modal saat klik di luar modal (overlay)
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.onclick = function(e) {
        if (e.target === this) tutupModal();
      };
    }
  }
  
  // Jika di halaman riwayat, tampilkan data riwayat
  if (document.getElementById('kontenRiwayat')) {
    tampilkanRiwayat();
  }
  
  // Event Listener untuk tombol Hapus Semua
  const btnHapusSemua = document.getElementById('btnHapusSemua');
  if (btnHapusSemua) {
    btnHapusSemua.onclick = function() { 
      hapusSemua(); 
    };
  }
  
  /**
   * EVENT DELEGATION untuk tombol Edit dan Hapus
   * Karena tombol dibuat secara dinamis oleh JavaScript, kita perlu event delegation
   * Event listener dipasang di document.body agar bisa menangkap klik dari elemen yang belum ada saat halaman dimuat
   */
  document.body.addEventListener('click', function(e) {
    const target = e.target;
    
    // Cek apakah yang diklik adalah tombol Edit
    if (target.classList && target.classList.contains('btn-edit')) {
      const id = target.getAttribute('data-id');
      if (id) {
        console.log('Klik Edit untuk ID:', id);
        editPesanan(id);
      }
    }
    
    // Cek apakah yang diklik adalah tombol Hapus
    if (target.classList && target.classList.contains('btn-hapus')) {
      const id = target.getAttribute('data-id');
      if (id) {
        console.log('Klik Hapus untuk ID:', id);
        hapusPesanan(id);
      }
    }
  });
}); 

// Konfirmasi bahwa script.js berhasil dijalankan
console.log('Script.js berhasil dijalankan!');