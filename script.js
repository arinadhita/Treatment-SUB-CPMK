// SCRIPT UNTUK SIYAZoo - VERSI FIX

// Fungsi untuk format tanggal ke bahasa Indonesia
function formatTanggal(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return d.getDate() + ' ' + bulan[d.getMonth()] + ' ' + d.getFullYear();
}

// Variabel global untuk modal
let layananDipilih = '';
let hargaDipilih = 0;
let modeEdit = false;
let idEdit = '';

// CEK APAKAH DI HALAMAN LAYANAN (ada modal)
function isLayananPage() {
  return document.getElementById('modalOverlay') !== null;
}

// BUKA MODAL (hanya berfungsi di halaman layanan)
function bukaModal(nama, harga, dataEdit = null) {
  // Cek apakah elemen modal ada (hanya di halaman layanan)
  if (!isLayananPage()) {
    // Jika di halaman riwayat, arahkan ke halaman layanan dulu
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
  
  layananDipilih = nama;
  hargaDipilih = harga;
  
  // Set judul modal
  let judul = '🎟️ Pesan ' + nama;
  if (harga > 0) judul += ' — Rp ' + harga.toLocaleString('id-ID');
  document.getElementById('modalJudul').innerText = judul;
  
  // Set tanggal minimal = hari ini
  const today = new Date().toISOString().split('T')[0];
  const inputTanggal = document.getElementById('inputTanggal');
  inputTanggal.min = today;
  
  if (dataEdit) {
    // Mode edit: isi form dengan data lama
    document.getElementById('inputNama').value = dataEdit.nama;
    document.getElementById('inputEmail').value = dataEdit.email;
    document.getElementById('inputTanggal').value = dataEdit.tanggal;
    document.getElementById('inputJumlah').value = dataEdit.jumlah;
    document.getElementById('inputPembayaran').value = dataEdit.pembayaran;
  } else {
    // Mode baru: reset form
    document.getElementById('inputNama').value = '';
    document.getElementById('inputEmail').value = '';
    document.getElementById('inputTanggal').value = today;
    document.getElementById('inputJumlah').value = 1;
    document.getElementById('inputPembayaran').value = '';
  }
  
  // Tampilkan modal
  document.getElementById('modalOverlay').classList.add('aktif');
  document.body.style.overflow = 'hidden';
}

// TUTUP MODAL
function tutupModal() {
  if (!isLayananPage()) return;
  
  document.getElementById('modalOverlay').classList.remove('aktif');
  document.body.style.overflow = '';
  modeEdit = false;
  idEdit = '';
}

// KONFIRMASI PESAN (TAMBAH BARU ATAU UPDATE)
function konfirmasiPesan() {
  if (!isLayananPage()) return;
  
  const nama = document.getElementById('inputNama').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const tanggal = document.getElementById('inputTanggal').value;
  const jumlah = parseInt(document.getElementById('inputJumlah').value);
  const bayar = document.getElementById('inputPembayaran').value;
  
  if (!nama || !email || !tanggal || !jumlah || !bayar) {
    alert('⚠️ Semua data harus diisi!');
    return;
  }
  
  // Ambil data lama dari LocalStorage
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  if (modeEdit && idEdit) {
    // UPDATE DATA
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
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    alert('✅ Data berhasil diupdate!');
    tutupModal();
    window.location.href = 'riwayat.html';
  } else {
    // TAMBAH DATA BARU
    const idBaru = 'SYZ' + Date.now().toString().slice(-6);
    const totalHarga = hargaDipilih > 0 ? hargaDipilih * jumlah : null;
    
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
    
    riwayat.unshift(dataBaru);
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    tutupModal();
    alert('✅ Pemesanan berhasil!');
    window.location.href = 'riwayat.html';
  }
}

// TAMPILKAN SEMUA RIWAYAT
function tampilkanRiwayat() {
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  const kontainer = document.getElementById('kontenRiwayat');
  if (!kontainer) return;
  
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
  
  const btnHapusSemua = document.getElementById('btnHapusSemua');
  if (btnHapusSemua) btnHapusSemua.style.display = 'inline-block';
  
  let html = '<p class="jumlah-pesanan">Menampilkan ' + riwayat.length + ' data pemesanan</p>';
  html += '<div class="tabel-wrapper"><table class="tabel-riwayat">';
  html += '<thead><tr>';
  html += '<th>No</th><th>Nama</th><th>Layanan</th><th>Tgl Kunjungan</th>';
  html += '<th>Jumlah</th><th>Pembayaran</th><th>Total</th><th>Status</th><th>Aksi</th>';
  html += '<tr></thead><tbody>';
  
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
    html += '<td>' + totalStr + '</td>';
    html += '<td><span class="badge-status">✅ ' + item.status + '</span></td>';
    html += '<td class="aksi-column">';
    html += '<button class="btn-edit" data-id="' + item.id + '">✏️ Edit</button>';
    html += '<button class="btn-hapus" data-id="' + item.id + '">🗑️ Hapus</button>';
    html += '</td>';
    html += '</tr>';
  }
  
  html += '</tbody></table></div>';
  kontainer.innerHTML = html;
}

// HAPUS PER PESANAN
function hapusPesanan(id) {
  if (!confirm('Yakin ingin menghapus pesanan ini?')) return;
  
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  let indexHapus = -1;
  for (let i = 0; i < riwayat.length; i++) {
    if (riwayat[i].id === id) {
      indexHapus = i;
      break;
    }
  }
  
  if (indexHapus !== -1) {
    riwayat.splice(indexHapus, 1);
    localStorage.setItem('siyazoo_riwayat', JSON.stringify(riwayat));
    alert('✅ Pesanan berhasil dihapus!');
    tampilkanRiwayat();
  }
}

// HAPUS SEMUA
function hapusSemua() {
  if (confirm('Yakin ingin menghapus SEMUA riwayat?')) {
    localStorage.removeItem('siyazoo_riwayat');
    tampilkanRiwayat();
  }
}

// EDIT PESANAN
function editPesanan(id) {
  let riwayat = localStorage.getItem('siyazoo_riwayat');
  riwayat = riwayat ? JSON.parse(riwayat) : [];
  
  let data = null;
  for (let i = 0; i < riwayat.length; i++) {
    if (riwayat[i].id === id) {
      data = riwayat[i];
      break;
    }
  }
  
  if (data) {
    modeEdit = true;
    idEdit = id;
    layananDipilih = data.layanan;
    hargaDipilih = data.harga;
    bukaModal(data.layanan, data.harga, data);
  } else {
    alert('Data tidak ditemukan!');
  }
}

// CEK APAKAH ADA PENDING EDIT DARI RIWAYAT
function cekPendingEdit() {
  const pending = localStorage.getItem('edit_pending');
  if (pending) {
    localStorage.removeItem('edit_pending');
    const data = JSON.parse(pending);
    modeEdit = data.modeEdit;
    idEdit = data.idEdit;
    layananDipilih = data.nama;
    hargaDipilih = data.harga;
    // Buka modal dengan data
    setTimeout(function() {
      bukaModal(data.nama, data.harga, data.data);
    }, 100);
  }
}

// EVENT LISTENER
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM siap');
  
  // Jika di halaman layanan, cek pending edit
  if (isLayananPage()) {
    cekPendingEdit();
    
    // Event untuk modal overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.onclick = function(e) {
        if (e.target === this) tutupModal();
      };
    }
  }
  
  // Jika di halaman riwayat, tampilkan riwayat
  if (document.getElementById('kontenRiwayat')) {
    tampilkanRiwayat();
  }
  
  // Event untuk tombol Hapus Semua
  const btnHapusSemua = document.getElementById('btnHapusSemua');
  if (btnHapusSemua) {
    btnHapusSemua.onclick = function() { hapusSemua(); };
  }
  
  // DELEGASI EVENT untuk tombol Edit dan Hapus
  document.body.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.classList && target.classList.contains('btn-edit')) {
      const id = target.getAttribute('data-id');
      if (id) {
        console.log('Klik Edit untuk ID:', id);
        editPesanan(id);
      }
    }
    
    if (target.classList && target.classList.contains('btn-hapus')) {
      const id = target.getAttribute('data-id');
      if (id) {
        console.log('Klik Hapus untuk ID:', id);
        hapusPesanan(id);
      }
    }
  });
});

console.log('Script.js berhasil dijalankan!');