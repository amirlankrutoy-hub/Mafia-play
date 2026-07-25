# 📚 React Router Darsligi — Ma'rifat Kutubxonasi loyihasi

Bu — React Router mavzusini o'rgatish uchun tayyorlangan **to'liq, ishlaydigan mini-loyiha**.
Loyiha "kichik onlayn kutubxona" ko'rinishida qurilgan va quyidagi 5 ta mavzuni o'z ichiga oladi:

1. React Router kirish
2. Dynamic routing
3. `useParams` Hook
4. Dinamik routingni yaratish
5. 404 sahifasi

## 🚀 Loyihani ishga tushirish

Kompyuteringizda [Node.js](https://nodejs.org) o'rnatilgan bo'lishi kerak (16+ versiya).

```bash
# 1. Loyiha papkasiga kiring
cd react-router-darslik

# 2. Kerakli paketlarni o'rnating
npm install

# 3. Loyihani ishga tushiring
npm run dev
```

Terminalda chiqqan manzilni (odatda `http://localhost:5173`) brauzerda oching.

## 🗂 Fayllar tuzilishi va nima uchun kerak

```
src/
├── main.jsx              → BrowserRouter bilan ilovani ishga tushiradi
├── App.jsx                → BARCHA Route'lar shu yerda belgilanadi (darsning yuragi)
├── index.css              → Vizual dizayn
├── data/
│   └── books.js           → Kitoblar bazasi (mock data, real loyihada API bo'ladi)
├── components/
│   ├── Navbar.jsx          → NavLink orqali navigatsiya menyusi
│   └── BookCard.jsx        → Har bir kitob kartasi (Link orqali /kitob/:id ga o'tadi)
└── pages/
    ├── Home.jsx            → "/" — statik route, barcha kitoblar ro'yxati
    ├── About.jsx           → "/haqida" — ikkinchi statik route
    ├── BookDetail.jsx      → "/kitob/:id" — DINAMIK route, useParams ishlatiladi
    └── NotFound.jsx        → "*" — 404 sahifasi
```

## 🎓 Darsni qanday o'tish mumkin (o'qituvchi uchun qo'llanma)

### 1-bosqich: React Router kirish (`src/main.jsx` va `src/App.jsx`)

O'quvchilarga tushuntiring: React — bitta HTML fayl (Single Page Application). Lekin foydalanuvchi
turli "sahifa"larni ko'rishni xohlaydi. `BrowserRouter` — butun ilovani o'rab, URL manzilni kuzatib
turadi. `Routes` va `Route` esa — "agar manzil shunday bo'lsa, shu komponentni ko'rsat" qoidasini
belgilaydi.

**Ko'rsating:** `App.jsx` faylini oching, `<Route path="/" element={<Home />} />` qatoriga e'tibor
qarating.

**Amaliyot:** O'quvchilardan yangi statik sahifa qo'shishni so'rang, masalan `/aloqa` (Kontakt sahifasi).

### 2-bosqich: Dynamic routing (`src/App.jsx` — `/kitob/:id` qatori)

Tushuntiring: Instagram profillari kabi — millionlab foydalanuvchi uchun bitta shablon yetarli.
`:id` — bu o'zgaruvchi qism, u har xil qiymat qabul qilishi mumkin.

**Ko'rsating:** `data/books.js` faylidagi 5 ta kitobni oching, keyin brauzerda
`/kitob/1`, `/kitob/2`, `/kitob/3` manzillariga qo'lda kirib ko'rsating — bitta komponent,
turli ma'lumot.

### 3-bosqich: useParams Hook (`src/pages/BookDetail.jsx`)

Bu — darsning eng muhim qismi. `const { id } = useParams()` qatorini ko'rsating va
tushuntiring: "`:id` — Route'dagi nom, `useParams()` esa shu nomni URL'dan o'qib beradi".

**Amaliyot:** O'quvchilarga `console.log(useParams())` qo'shib, brauzer konsolida
natijani ko'rishni tavsiya qiling.

### 4-bosqich: Dinamik routingni yaratish (`src/components/BookCard.jsx`)

Ko'rsating: `<Link to={`/kitob/${book.id}`}>` — bu yerda har bir karta o'zining ID'siga mos
manzilga yo'naltiriladi. `.map()` orqali 5 ta kitobdan 5 ta turli link avtomatik hosil bo'ladi.

**Amaliyot:** `data/books.js` ga yana 2-3 ta kitob qo'shib, ular avtomatik ravishda
sahifada va o'z alohida sahifasida paydo bo'lishini ko'rsating — kod o'zgarmaydi, faqat
ma'lumot o'zgaradi.

### 5-bosqich: 404 sahifasi (`src/pages/NotFound.jsx`)

Brauzerda mavjud bo'lmagan manzilga kiring, masalan `/salom-dunyo`. `App.jsx` dagi
`<Route path="*" element={<NotFound />} />` qatorini ko'rsating — `"*"` belgisi "boshqa
hech narsaga mos kelmagan barcha manzillar" degani.

**Muhim eslatma o'quvchilarga:** `Route`larning **tartibi** ahamiyatli emas React Router 6da,
lekin `"*"` odatda ro'yxatning **oxirida** yoziladi — chunki u "hammasini" ushlaydi.

## 💡 Real loyihalarda qayerda ishlatiladi (o'quvchilarga aytish uchun)

| Mavzu | Qayerda ishlatiladi |
|---|---|
| React Router | Deyarli har qanday professional sayt: onlayn-do'kon, ta'lim platformasi, ijtimoiy tarmoq |
| Dynamic routing | Mahsulot sahifalari (`/product/123`), foydalanuvchi profillari (`/user/john`), blog maqolalari |
| useParams | URL'dan ID/nom olib, shu asosida API'dan ma'lumot so'rash (`fetch`) |
| 404 sahifa | Har bir jiddiy loyihada bo'ladi — foydalanuvchiga yaxshi tajriba (UX) berish uchun |

## 📝 Uy vazifasi g'oyalari

1. Yangi `/kategoriya/:genre` route qo'shing — janr bo'yicha kitoblarni filtrlaydigan sahifa yarating.
2. `BookDetail` sahifasiga "Sevimlilarga qo'shish" tugmasini qo'shing (holat uchun `useState` kerak bo'ladi).
3. `NotFound` sahifasiga 5 soniyadan keyin avtomatik bosh sahifaga qaytaradigan kod qo'shing
   (`useNavigate` va `useEffect` kombinatsiyasi kerak bo'ladi — bu keyingi darsga ko'prik bo'lishi mumkin).
