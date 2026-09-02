(()=>{
const rows=[
['agp130-depovent','Depovent','Almacén / operador logístico','Callao','902743029','Jr. Víctor A. Belaúnde 901, Carmen de la Legua Reynoso','https://depovent.com.pe/','Sitio oficial · WhatsApp verificado'],
['agp130-guardatodo','Guardatodo','Almacén / depósitos','Callao','908831923','Av. Prolongación Centenario 777, Callao','https://www.guardatodo.pe/','Sitio oficial · WhatsApp verificado'],
['agp130-logisminsa','Logisminsa','Almacén / operador logístico','Ventanilla','998108118','Av. Del Bierzo km 3.2, Ventanilla, Callao','https://logisminsa.com/','Sitio oficial · WhatsApp verificado'],
['agp130-aduamerica','Aduamerica','Almacén / operador logístico','Callao','940207492','Av. Federico Fernandini 253, Callao','https://aduamerica.com/','Sitio oficial · WhatsApp verificado'],
['agp130-ventrox','Ventrox','Almacén / operador logístico','Callao','986511366','Callao (almacén)','https://ventrox.com.pe/','Sitio oficial · WhatsApp verificado'],
['agp130-transber','Transber','Almacén / operador logístico','Callao','990209871','Calle Cadmio 129, Urb. Industrial Grimanesa, Callao','https://transporte.pe/empresa/transber/','Ficha empresarial · WhatsApp verificado'],
['agp130-lsgroup','LS Group Perú','Importadora / distribuidora','Callao','968769401','Calle República de Guyana 100, Carmen de la Legua, Callao','https://www.lsgroup-p.com/','Sitio oficial · WhatsApp verificado'],
['agp130-omisse','Importaciones Omisse SAC','Importadora / construcción','Callao','975710508','Av. Alejandro Bertello 5031, Callao','https://www.omisse.com.pe/','Sitio oficial · WhatsApp verificado'],
['agp130-timek','Importaciones Timek Perú SAC','Importadora / tecnología','Cercado de Lima','933549151','Jr. Leticia 948, Lima','https://timekperu.com/','Sitio oficial · WhatsApp verificado'],
['agp130-smc','Grupo Importadora SMC','Importadora / tecnología','Lima','', 'Lima','https://importadorasmcsac.pe/','Sitio oficial · WhatsApp disponible; número pendiente de extracción'],
['agp130-jcs','J.C.S IMPORT','Importadora / distribuidora mayorista','Cercado de Lima','', 'Av. Abancay 224 Int. 110, Cercado de Lima','https://www.jcslac.com/','Sitio oficial · WhatsApp disponible; número pendiente de extracción'],
['agp130-qtc','Grupo QTC','Distribuidora / tecnología','San Isidro','912745902','Av. República de Panamá 3609, San Isidro','https://qtc.pe/','Directorio empresarial verificado · WhatsApp'],
['agp130-computec','Computecperu SAC','Distribuidora / tecnología','Cercado de Lima','965137244','Av. Uruguay 483, Lima','https://computecperu.com/','Sitio oficial · WhatsApp verificado'],
['agp130-mundoclean','Mundo Clean It','Distribuidora / limpieza','Lima','920463356','Av. José Olaya 115, Lima','https://www.mundocleanit.com/','Sitio oficial · WhatsApp verificado'],
['agp130-icerikko','ICE RIKKO','Distribuidora / mayorista','Cercado de Lima','988084863','Jr. Miguel Baquero 156, Cercado de Lima','https://icerikko.com.pe/','Sitio oficial · contacto móvil publicado'],
['agp130-technoworld','Technoworld Perú','Distribuidora / tecnología','Lima','954716527','Av. Petit Thouars 1473, Lima','https://linktr.ee/technoworldperu','Perfil comercial · enlace WhatsApp verificado']
];
const base=window.INVENTORY_LEADS||[];
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const digits=s=>(s||'').replace(/\D/g,'');
const names=new Set(base.map(x=>norm(x.company)));
const phones=new Set(base.flatMap(x=>[x.phone,x.whatsapp]).map(digits).filter(x=>x.length>=9));
const extra=rows.map((r,i)=>({id:r[0],company:r[1],sector:r[2],district:r[3],score:94-i%4,closeScore:95-i%3,phone:r[4]?r[4].replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3'):'',whatsapp:r[7].toLowerCase().includes('whatsapp verificado')||r[7].toLowerCase().includes('directorio empresarial verificado')||r[7].toLowerCase().includes('enlace whatsapp verificado')?r[4].replace(/(\d{3})(\d{3})(\d{3})/,'$1 $2 $3'):'',email:'',web:r[6],address:r[5],source:r[7]}));
window.INVENTORY_LEADS=base.concat(extra.filter(x=>!names.has(norm(x.company))&&(!digits(x.phone)||!phones.has(digits(x.phone)))));
})();