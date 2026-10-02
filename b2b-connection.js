// Published company portal. Private data stays in Google Apps Script.
const KLAMAS_B2B_URL='https://script.google.com/macros/s/AKfycbx7fDL8T7ikXM4R6b5Ti2jtM2V51BA_Rnlu4VkhfAphvnALq4jvGAGhmzi5O7Nl5WODxQ/exec';
(()=>{
  const original=b2bLogin;
  b2bLogin=function(){
    original();
    const card=document.querySelector('.b2b-login-card');
    if(!card)return;
    card.innerHTML='<span class="business-kicker" style="color:#c24b28">ДЛЯ КЛИЕНТОВ КЛАМАС</span><h2>Кабинет вашей компании</h2><p>Заказы, отгрузки, платежи и документы вашей компании.</p><a id="company-portal-link" class="primary" target="_blank" rel="noopener">Войти в кабинет компании ↗</a><p>Для входа используйте email и личный ключ, полученный у менеджера. Кабинет откроется в новой вкладке.</p><hr style="border:0;border-top:1px solid #e5e8e8;margin:25px 0"><p>Хотите сначала посмотреть, как устроен кабинет?</p><button class="b2b-plain" id="b2b-login">Посмотреть демо</button>';
    document.getElementById('company-portal-link').href=KLAMAS_B2B_URL;
  };
})();
