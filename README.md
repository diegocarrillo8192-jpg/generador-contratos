# Generador de Contratos · Panamá

Aplicación web (Next.js 15 + React 19) para redactar, revisar, firmar y enviar contratos bajo la legislación de la República de Panamá. Todo funciona en el navegador: no hay servidor de datos y nada se envía a terceros.

## Contratos disponibles

- Contrato individual de trabajo por **tiempo definido** (Art. 74 C.T.)
- Contrato individual de trabajo por **obra determinada**
- Contrato individual de trabajo por **tiempo indefinido**, con período de prueba (Art. 78 C.T.)
- Contrato de **prestación de servicios profesionales** (independiente / B2B)

## Funciones

- **Asistente en 8 pasos** con progreso, validación por sección y vista previa en vivo.
- **Revisión legal automática**: datos faltantes, jornada máxima (Art. 31), período de prueba de hasta 3 meses, duración del contrato definido, formato de cédula, RUC/DV y firmas desactualizadas.
- **Biblioteca de cláusulas** opcionales (exclusividad, viáticos, comisiones, vehículo, garantía, limitación de responsabilidad, arbitraje, fuerza mayor, firma electrónica, anticorrupción, etc.).
- **Firma manuscrita o virtual**: firma en pantalla (firma electrónica simple · Ley 51 de 2008, modificada por la Ley 82 de 2012) con fecha, hora y huella del documento. Si el texto cambia después de firmar, la firma se marca como desactualizada.
- **Firmar y enviar**: PDF con firmas, compartir desde el celular o correo prellenado; exportación para firma remota.
- **Logo y membrete** de la empresa en la vista previa, el PDF y el Word.
- **Exportación**: impresión / PDF del navegador, PDF para adjuntar, Word (.docx) editable y texto plano.
- **Calculadora**: salario neto estimado y costo patronal (CSS escalonada, Seguro Educativo, riesgos profesionales, provisiones de XIII mes y vacaciones) o, en servicios, ITBMS e hitos de pago.
- **Mis contratos**: autoguardado, contratos guardados, duplicar y respaldo/importación en JSON.
- Montos en letras, marca de agua «BORRADOR», papel Carta o A4, tema claro/oscuro y diseño adaptable a celular.
- **Manual de uso** paso a paso en `/manual`.

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3005
npm run build
```

> Herramienta de apoyo para la redacción de documentos. No constituye asesoría legal. Las tasas de CSS/ISR son referenciales: verifíquelas con la CSS, la DGI o un contador.
