// Şifre Gücü Analiz Fonksiyonu
function checkStrength() {
    const password = document.getElementById('passInput').value;
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    
    let score = 0;
    if (password.length > 5) score++; // Bir şeyler yazıldıysa başla
    if (/[A-Z]/.test(password) && password.length > 5) score++; // Büyük harf
    if (/[0-9]/.test(password) && password.length > 5) score++; // Rakam
    if (/[^A-Za-z0-9]/.test(password)) score++; // Özel karakter
    if (password.length > 10) score++; // 10+ karakter

    // Puanlara göre görsel güncelleme (Renk ve Genişlik)
    const levels = [
        { width: "5%", color: "bg-red-500", label: "En az 6 karakter gerekli" },
        { width: "20%", color: "bg-red-500", label: "Zayıf" },
        { width: "40%", color: "bg-orange-500", label: "Orta" },
        { width: "60%", color: "bg-yellow-500", label: "İyi" },
        { width: "80%", color: "bg-blue-500", label: "Güçlü" },
        { width: "100%", color: "bg-green-600", label: "Mükemmel" }
    ];

    const res = levels[score];
    bar.style.width = res.width;
    bar.className = `h-2 rounded transition-all duration-300 ${res.color}`;
    text.innerText = "Güçlük Seviyesi: " + res.label;
}
