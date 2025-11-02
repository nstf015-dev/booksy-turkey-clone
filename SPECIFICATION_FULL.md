# Booksy Turkey — Tam Ürün Modeli (Türkçe)

Bu dosya, Booksy (booksy.com) benzeri bir platformun Türkiye'ye tam uyarlanmış ürün modelini, API taslağını, veri modellerini, yetki matrisini, UI akışlarını ve ödeme simülasyonunu içerir. Amaç: tam bir üretime hazır plan sunmak.

İçindekiler
1. Proje vizyonu
2. Kullanıcı roller ve izinler
3. Modüller & özellikler (tam liste)
4. Teknik mimari
5. Veri modelleri (SQL örnekleri)
6. API uç noktaları (özet + OpenAPI referansı)
7. Ödeme mimarisi — simülasyon (Iyzico/PayTR yerine şimdilik simülatör)
8. UI/UX ekran akışları
9. İş akışları & edge-case'ler
10. Test planı
11. Dağıtım & DevOps
12. Yol haritası & teslimatlar

--- 1. Proje vizyonu ---
Booksy Turkey, salon, kuaför, spa, güzellik ve hizmet sektörüne yönelik rezervasyon, yönetim ve pazarlama araçları sunan bir pazar yeridir. Booksy.com'un bütün fonksiyonlarını örnek alır, Türkiye'ye özgü ödeme sağlayıcıları, yasal gereklilikler ve dil/para birimi ile tamamen uyumlu olacak şekilde geliştirilir.

--- 2. Kullanıcı roller ve izinler ---
Temel roller:
- super_admin: platform üzerinde tüm kontroller.
- platform_admin: işletme onayları, plan ve komisyon yönetimi, moderasyon.
- business_owner: işletme ayarları, finansal veriler, personel atama.
- manager: işletme yöneticisi; hizmetler, takvim ve promosyon yönetimi.
- staff: takvim ve kendi rezervasyonlarını yönetir, müşteri bilgilerini sınırlandırılmış şekilde görür.
- customer: rezervasyon yapan son kullanıcı.

Her rol için detaylı izin listesi IAM dizininde yer alır (iam/permissions.json).

--- 3. Modüller & özellikler (tam liste) ---
(uzun liste: arama, profil, rezervasyon, calendar, staff, crm, promosyon, boost, reports, pos, inventory, multi-branch, forms, data-import, integrations, admin tools vb.)

--- 4. Teknik mimari ---
- API: Node.js + TypeScript (NestJS önerilir) — RESTful (OpenAPI/Swagger). Microservice-ready tasarım.
- Frontend: Next.js (müşteri) + React (işletme + admin).
- Mobil: React Native (TypeScript).
- Veritabanı: PostgreSQL (primary). Redis: cache, locks, queue backend (BullMQ).
- Search: Elasticsearch (opsiyonel) veya Postgres + pg_trgm.
- Storage: S3 (AWS/DigitalOcean Spaces).
- CI/CD: GitHub Actions. Containerization: Docker.Kubernetes production.

--- 5. Veri modelleri (kısmi SQL örnekleri) ---
Ayrıntılı şema sql/001_init.sql dosyasında bulunur.

--- 6. API uç noktaları ---
OpenAPI spec: openapi.yaml. (Ödeme simülasyonu ile uyumlu endpointler dahil.)

--- 7. Ödeme mimarisi — simülasyon ---
Geliştirme ve ilk entegrasyon aşamasında gerçek Iyzico/PayTR yerine yerel bir simülatör kullanıyoruz. Simülatör:
- Ödeme intent oluşturma
- Ödeme onayı (succeed/fail)
- Webhook gönderimi (imzalı)
- Tokenization (sanal token)

Simülatör kodu: src/payments/simulator.ts

--- 8. UI/UX ekran akışları ---
Detaylı ekran listesi, booking akış adımları, işletme paneli ve admin paneli yer alır. (UI prototipleri sonraki aşamada figma/tsx şeklinde üretilir.)

--- 9. İş akışları & edge-case'ler ---
- Çakışma önleme: Postgres exclusion constraint + Redis locks + Idempotency-Key.
- Ödeme başarısızlık senaryosu: booking PENDING_PAYMENT, TTL 15dk.
- İade/chargeback: admin moderated.

--- 10. Test planı ---
Unit, Integration, E2E (Cypress/Detox), yük testi (k6), güvenlik taramaları.

--- 11. Dağıtım & DevOps ---
K8s + Helm, Prometheus + Grafana, Sentry. Secrets via KMS/Vault.

--- 12. Yol haritası & teslimatlar ---
Tam model ve üretime hazır kod tabanı; ödeme simülatörü ile test edilebilir uygulama. Sonraki adım: gerçek ödeme gateway entegrasyonuna geçiş.

(Detaylı modeller, API tanımları ve kodlar repoda ilgili dosyalarda yer alır.)

--- EOF