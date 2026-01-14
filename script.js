// Tab geçiş fonksiyonu
function switchTab(type) {
    const area = document.getElementById('content-area');
    
    // Tab butonlarının aktif stilini güncelle
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('border-b-4', 'border-blue-600');
        btn.classList.add('border-b-4', 'border-transparent');
    });
    
    if(type === 'url') {
        area.innerHTML = `
            <h2 class="text-xl font-bold mb-4 text-green-800">Link Güvenlik Testi</h2>
            <input type="text" id="urlInput" class="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" placeholder="https://ornek-site.com">
            <button onclick="urlAnalizEt()" class="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">URL'yi Tara</button> 
            <div id="sonuc-ekrani2"></div>`;
        // Aktif tab'ı işaretle
        document.querySelector('button[onclick*="url"]').classList.remove('border-transparent');
        document.querySelector('button[onclick*="url"]').classList.add('border-green-600');
    } 
    else if(type === 'password') {
        area.innerHTML = `
            <h2 class="text-xl font-bold mb-4 text-yellow-800">Şifre Güvenlik Testi</h2>
            <input type="password" id="passInput" oninput="checkStrength()" class="w-full p-4 border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none" placeholder="Şifrenizi yazın...">
            <div class="mt-3 h-2 w-full bg-gray-200 rounded">
                <div id="strengthBar" class="h-2 bg-red-500 rounded transition-all duration-300" style="width: 1%"></div>
            </div>
            <p id="strengthText" class="text-xs mt-2 text-gray-500">Güçlük Seviyesi: Bekleniyor...</p>`;
        // Aktif tab'ı işaretle
        document.querySelector('button[onclick*="password"]').classList.remove('border-transparent');
        document.querySelector('button[onclick*="password"]').classList.add('border-yellow-600');
    } 
    else {
        // Mail Analizi (Ana Sayfa Yapısı)
        area.innerHTML = `
            <div id="mail-section">
                <h2 class="text-xl font-bold mb-4 text-blue-800">Şüpheli Mail İçeriğini Yapıştırın</h2>
                <textarea id="mailMetni" class="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Gelen mailin metnini buraya yapıştırın..."></textarea>
                <button onclick="analizGonder()" class="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">Analiz Et</button>
                <div id="sonuc-ekrani"></div>
            </div>`;
        // Aktif tab'ı işaretle
        document.querySelector('button[onclick*="mail"]').classList.remove('border-transparent');
        document.querySelector('button[onclick*="mail"]').classList.add('border-blue-600');
    }
}

// Mail analiz fonksiyonu
async function analizGonder() {
    const mailInput = document.getElementById('mailMetni');
    const sonucAlani = document.getElementById('sonuc-ekrani');
    
    if(!mailInput || !mailInput.value.trim()) {
        alert("Lütfen analiz edilecek bir metin girin.");
        return;
    }

    sonucAlani.innerHTML = "<p class='mt-4 text-blue-600 animate-bounce text-center font-bold'>Analiz ediliyor...</p>";

    try {
        const response = await fetch('http://127.0.0.1:8000/analyze-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: mailInput.value })
        });

        if (!response.ok) throw new Error("Sunucu yanıt vermedi.");
        const veri = await response.json();

        // Sonuç Kutusu
        const bgClass = veri.color === 'red' ? 'bg-red-100 border-red-500 text-red-900' : 
                       (veri.color === 'yellow' ? 'bg-yellow-100 border-yellow-500 text-yellow-900' 
                                 : 'bg-green-100 border-green-500 text-green-900');

        // Uyarıları kontrol et
        const warnings = veri.warnings || [];
        const warningsHTML = warnings.length > 0 
            ? `<ul class="mt-3 space-y-1 text-sm list-inside list-disc">
                  ${warnings.map(w => `<li>${w}</li>`).join('')}
              </ul>` 
            : '<p class="mt-3 text-sm">Herhangi bir uyarı bulunamadı.</p>';

        // Skoru kontrol et
        const score = veri.score !== undefined ? veri.score : 0;

        sonucAlani.innerHTML = `
            <div class="mt-6 p-5 rounded-xl border-l-8 ${bgClass} shadow-sm">
                <h3 class="font-black text-xl mb-2 italic">ANALİZ SONUCU: ${veri.status || 'Bilinmeyen'}</h3>
                <p class="font-bold">Risk Skoru: %${score}</p>
                ${warningsHTML}
            </div>`;

    } catch (hata) {
        sonucAlani.innerHTML = `
            <div class="mt-4 p-4 bg-gray-100 border-l-4 border-gray-500 text-gray-700 font-bold">
                ⚠️ Sunucu Hatası: uvicorn çalışıyor mu? (http://127.0.0.1:8000)
            </div>`;
        console.error("Hata:", hata);
    }
}

// URL analiz fonksiyonu
async function urlAnalizEt() {
    const urlInput = document.getElementById('urlInput');
    const sonucAlani = document.getElementById('sonuc-ekrani2');
    
    // Null kontrolü
    if (!urlInput || !urlInput.value || !urlInput.value.trim()) {
        sonucAlani.innerHTML = `
            <div class="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <strong>Hata:</strong> Lütfen bir URL girin!
            </div>`;
        return;
    }

    sonucAlani.innerHTML = "<p class='text-center animate-pulse'>Link taranıyor...</p>";

    try {
        const response = await fetch('http://127.0.0.1:8000/analyze-url', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                url: urlInput.value.trim() 
            })
        });

        // HTTP hata kontrolü
        if (!response.ok) {
            throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }

        const veri = await response.json();
        
        // warnings kontrolü
        const warnings = veri.warnings || [];
        const warningsList = warnings.length > 0 
            ? `<ul class="text-xs mt-2 list-disc ml-4">
                  ${warnings.map(w => `<li>${w}</li>`).join('')}
               </ul>`
            : '<p class="text-xs mt-2">Uyarı bulunamadı.</p>';
        
        // score kontrolü
        const score = veri.score !== undefined ? veri.score : 0;
        
        // color kontrolü - varsayılan yeşil
        const color = veri.color || 'green';
        const bg = color === 'red' ? 'bg-red-100 text-red-900 border-red-500' : 
                   (color === 'yellow' ? 'bg-yellow-100 text-yellow-900 border-yellow-500' : 
                    'bg-green-100 text-green-900 border-green-500');

        // status kontrolü
        const status = veri.status || 'Bilinmeyen Durum';

        sonucAlani.innerHTML = `
            <div class="mt-4 p-4 rounded-lg border-l-4 ${bg}">
                <h3 class="font-bold uppercase">${status}</h3>
                <p>Risk Puanı: %${score}</p>
                ${warningsList}
            </div>`;
            
    } catch (hata) {
        console.error('Analiz hatası:', hata);
        sonucAlani.innerHTML = `
            <div class="mt-4 p-4 rounded-lg border-l-4 bg-red-100 text-red-900 border-red-500">
                <h3 class="font-bold uppercase">Hata</h3>
                <p>Sunucuya bağlanılamadı veya analiz sırasında hata oluştu.</p>
                <p class="text-xs mt-2">${hata.message}</p>
            </div>`;
    }
}

// Sayfa yüklendiğinde mail analizini göster
document.addEventListener('DOMContentLoaded', function() {
    // İlk açılışta mail analizini göster
    if (!window.location.hash) {
        switchTab('mail');
    }
    
    // Tab butonlarına aktif stil ekle
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            tabButtons.forEach(b => b.classList.remove('tab-active'));
            this.classList.add('tab-active');
        });
    });
});