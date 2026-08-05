const LOCAL_ENDPOINT = 'http://localhost:3000/api/claim';
const TARGET_LOT_ID = 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f'; // Sesuai UUID lot tiruan Anda

// 2. Generate 50 UUID tiruan untuk user

const DUMMY_USER_IDS = [
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000014',
  '00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000016',
  '00000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000018',
  '00000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000024',
  '00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000026',
  '00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000028',
  '00000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000032',
  '00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000034',
  '00000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000036',
  '00000000-0000-0000-0000-000000000037', '00000000-0000-0000-0000-000000000038',
  '00000000-0000-0000-0000-000000000039', '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000044',
  '00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000046',
  '00000000-0000-0000-0000-000000000047', '00000000-0000-0000-0000-000000000048',
  '00000000-0000-0000-0000-000000000049', '00000000-0000-0000-0000-000000000050'
];

async function runRaceConditionTest() {
  console.log(`🚀 Memulai simulasi perebutan stok: 50 user menembak lot secara paralel...`);
  
  // Buat 50 request secara bersamaan menggunakan native fetch
  const requests = DUMMY_USER_IDS.map(async (userId, index) => {
    try {
      const res = await fetch(LOCAL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-test': 'true',
          'x-user-id': userId
        },
        body: JSON.stringify({ lot_id: TARGET_LOT_ID })
      });
      
      const data = await res.json();
      
      return {
        success: res.ok,
        status: res.status,
        userIndex: index + 1,
        data: data
      };
    } catch (err) {
      return {
        success: false,
        status: 500,
        userIndex: index + 1,
        error: err.message
      };
    }
  });

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  console.log(`\n⏱️ Selesai mengirim seluruh request dalam ${duration}ms.\n`);

  // Evaluasi Hasil
  let successCount = 0;
  let soldOutCount = 0;
  let otherErrorCount = 0;

  results.forEach((res) => {
    if (res.success && res.status === 200) {
      successCount++;
      console.log(`✅ User #${res.userIndex} SUKSES! Mengamankan stok. URL checkout: ${res.data.checkout_url}`);
    } else if (res.status === 410) {
      soldOutCount++;
    } else {
      otherErrorCount++;
      console.log(`❌ User #${res.userIndex} gagal dengan error (${res.status}): ${res.error || res.data?.error}`);
    }
  });

  console.log("\n================ REKAP HASIL TEST ================");
  console.log(`Target Kelulusan Minggu 1: Tepat 1 Sukses, 49 Gagal Terjual (410) [1]`);
  console.log(`--------------------------------------------------`);
  console.log(`Total Request Terproses : ${results.length}`);
  console.log(`Sukses Ter-hold (200)  : ${successCount} (Sistem Aman) [2]`);
  console.log(`Gagal Terjual (410)    : ${soldOutCount}`);
  console.log(`Error Lainnya          : ${otherErrorCount}`);
  console.log("==================================================");

  if (successCount === 1 && soldOutCount === 49) {
    console.log("🏆 STATUS: LULUS AKSEPTASI! Nol Oversell berhasil dibuktikan. [2]");
  } else {
    console.log("⚠️ STATUS: GAGAL AKSEPTASI. Periksa kembali logika transaksi database.");
  }
}

runRaceConditionTest();