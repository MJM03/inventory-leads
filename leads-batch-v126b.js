(()=>{const rows=[
['pikotin','Pikotin','Pet shop','San Miguel','906944636','Av. Libertad 1630','Sitio oficial · celular comercial público'],
['mascotalo','Mascotalo','Pet shop','San Miguel','944757334','Av. de los Patriotas 342B','Directorio comercial · celular público'],
['la-pet-sm','La Pet San Miguel','Pet shop','San Miguel','994693575','Av. La Paz 2561','Directorio comercial · celular público'],
['soul-aqua','Soul Aqua','Pet shop / acuario','San Miguel','944352490','José Gabriel Aguilar 323','Directorio comercial · celular público'],
['cucciolotti','Cucciolotti Boutique','Pet shop / accesorios','San Miguel','933553613','Boulevard Plaza Mantaro','Directorio comercial · celular público'],
['pet-loyalty','Pet Loyalty Pet Shop','Pet shop','San Miguel','960762057','Av. Universitaria 349','Directorio comercial · celular público'],
['aquarium-shop-peru','Aquarium Shop Perú','Pet shop / acuario','San Miguel','941341871','Av. Costanera 2438','Directorio comercial · celular público'],
['animals-pet-shop','Animals Pet Shop','Pet shop','San Martín de Porres','944582486','Jr. Salaverry 551','Punto de venta público · celular comercial'],
['avapet','Avapet Petshop','Pet shop','San Juan de Miraflores','988394921','Av. Los Álamos Mz F Lt 10','Punto de venta público · celular comercial'],
['veterinaria-prado','Veterinaria Prado','Pet shop / veterinaria','San Juan de Miraflores','943562802','Av. Belisario Suárez 935','Punto de venta público · celular comercial'],
['mis-amores-pet','Mis Amores Pet Shop','Pet shop','San Miguel','982446685','Av. La Marina 3620','Punto de venta público · celular comercial'],
['11-patas','11 Patas Petshop','Pet shop','San Miguel','994604954','Av. Universitaria 528','Punto de venta público · celular comercial'],
['animal-zone','Veterinaria Animal Zone','Pet shop / veterinaria','San Miguel','983773957','Jr. Francisco Bolognesi 127','Punto de venta público · celular comercial'],
['luka-market','Luka Market','Minimarket / abarrotes','San Miguel','987281254','Av. Costanera 1040','Punto de venta público · celular comercial'],
['spatitas','Spatitas Spa Canino y Petshop','Pet shop','Santa Anita','940085339','Av. Los Eucaliptos 911','Punto de venta público · celular comercial']
];const base=window.INVENTORY_LEADS||[],norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,''),dig=s=>(s||'').replace(/\D/g,'');const names=new Set(base.map(x=>norm(x.company))),phones=new Set(base.flatMap(x=>[x.phone,x.whatsapp]).map(dig).filter(Boolean));const extra=rows.map((r,i)=>({id:'v126b-'+r[0],company:r[1],sector:r[2],district:r[3],score:87+(i%6),closeScore:89+(i%6),phone:r[4],whatsapp:r[4],email:'',web:'',address:r[5],source:r[6]})).filter(x=>!names.has(norm(x.company))&&!phones.has(dig(x.whatsapp)));window.INVENTORY_LEADS=base.concat(extra);window.__AGP_V126_BUFFER=extra.length;})();