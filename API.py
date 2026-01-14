from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI()

# Tarayıcı erişim izni (CORS) - Bu olmazsa JS bağlanamaz
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veri modelleri
class MailData(BaseModel):
    content: str

class URLData(BaseModel):
    url: str

@app.post("/analyze-mail")
async def analyze_mail(data: MailData):
    text = data.content.lower()
    risk_score = 0
    reasons = []

    # Gelişmiş Risk Analizi
    keywords = {
        "acil": 25, "derhal": 25, "fatura": 10, "ödeme": 10, 
        "kazandınız": 15, "hediye": 15, "askıya": 15, "doğrulama": 15,
        "giriş yap": 15, "şifre güncelle": 15, "tebrikler": 15,
        "iptal": 10, "linke tıkla": 15, "hemen":15, "tıkla":10, "kayıt ol":10,
        "kredi kartı bilgilerini gir":10, "ödeme yap":20, "ödeme yapınız":20, "kullanıcı bilgilerini gir":20, 
        "şifre":10 , "linke 3ir":15, "linke tıkla":35, "formu doldur":10   
    }

    for word, point in keywords.items():
        if word in text:
            risk_score += point
            reasons.append(f"Şüpheli işlem tespit edildi: '{word}'")

    # Link Kontrolü
    urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', text)
    if len(urls) > 0:
        risk_score += 25
        reasons.append(f"{len(urls)} adet link bulundu. Dikkatli olun. Mailin nerden geldiğini doğrulayın")

    # Durum Belirleme
    status = "Güvenli"
    color = "green"

    if risk_score > 30 or len(urls):
        status = "Yüksek riskli / Oltalama olabilir"
        color = "red"
    elif len(urls):
        status = "Linke girmeden önce dikkat edin"
        color = "yellow"
    elif risk_score >= 40: 
        status = "Riskli"
        color = "red"
    elif risk_score > 10 and risk_score< 30: 
        status = "Dikkatli Olun"
        color = "green"

        
    return {
        "score": risk_score, 
        "status": status, 
        "warnings": reasons,
        "color": color
    }

@app.post("/analyze-url")
async def analyze_url(data: URLData):
    url = data.url.lower()
    risk_score = 0
    reasons = []

    # 1. Protokol Kontrolü
    if not url.startswith("https://"):
        risk_score += 30
        reasons.append("Güvenli olmayan bağlantı (HTTP).")

    # 2. Link Kısaltma Servisleri (Genelde oltalama için kullanılır)
    shorteners = ["bit.ly", "t.co", "tinyurl.com", "rebrand.ly"]
    if any(s in url for s in shorteners):
        risk_score += 40
        reasons.append("Link kısaltma servisi kullanılmış (Gizli hedef).")

    # 3. Şüpheli Karakterler ve IP kullanımı
    if re.search(r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
        risk_score += 50
        reasons.append("URL yerine doğrudan IP adresi kullanılmış (Çok riskli).")

    # 4. Tehlikeli Uzantılar
    if any(url.endswith(ext) for ext in [".exe", ".zip", ".bat", ".scr"]):
        risk_score += 60
        reasons.append("Doğrudan indirilebilir zararlı dosya uzantısı.")

    # 5. Şüpheli kelimeler URL'de
    suspicious_words = ["login", "verify", "account", "secure", "update", "confirm"]
    if any(word in url for word in suspicious_words):
        risk_score += 20
        reasons.append("URL'de şüpheli kelimeler bulundu.")

    status = "Güvenli"
    color = "green"
    if risk_score >= 50:
        status = "Tehlikeli"
        color = "red"
    elif risk_score >= 30:
        status = "Dikkatli Olun"
        color = "yellow"

    return {
        "score": risk_score,
        "status": status,
        "warnings": reasons,
        "color": color
    }

# Çalıştırmak için: uvicorn API:app --reload
