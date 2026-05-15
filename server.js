const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Datos simulados
const tramites = [
  {
    id: "T001",
    nombre: "Renovación de DNI",
    entidad: "RENIEC",
    plazo: "5 días hábiles",
    costo: "S/ 21.00",
    estado: "Disponible",
  },
  {
    id: "T002",
    nombre: "Licencia de Conducir",
    entidad: "MTC",
    plazo: "10 días hábiles",
    costo: "S/ 96.30",
    estado: "Disponible",
  },
  {
    id: "T003",
    nombre: "Pasaporte",
    entidad: "Migraciones",
    plazo: "2 días hábiles",
    costo: "S/ 98.60",
    estado: "Disponible",
  },
  {
    id: "T004",
    nombre: "RUC - Inscripción",
    entidad: "SUNAT",
    plazo: "1 día hábil",
    costo: "Gratuito",
    estado: "Disponible",
  },
  {
    id: "T005",
    nombre: "Certificado de Antecedentes Penales",
    entidad: "PNP",
    plazo: "3 días hábiles",
    costo: "S/ 42.90",
    estado: "Disponible",
  },
  {
    id: "T006",
    nombre: "Partida de Nacimiento",
    entidad: "RENIEC",
    plazo: "1 día hábil",
    costo: "S/ 10.60",
    estado: "Disponible",
  },
];

// GET /tramites - lista todos o filtra por entidad
app.get("/tramites", (req, res) => {
  const { entidad } = req.query;
  const resultado = entidad
    ? tramites.filter((t) =>
        t.entidad.toLowerCase().includes(entidad.toLowerCase())
      )
    : tramites;

  res.json({ ok: true, total: resultado.length, data: resultado });
});

// POST /consulta - busca trámite por nombre o ID
app.post("/consulta", (req, res) => {
  const { termino } = req.body;

  if (!termino || termino.trim().length < 2) {
    return res
      .status(400)
      .json({ ok: false, mensaje: "Ingrese al menos 2 caracteres para buscar." });
  }

  const resultados = tramites.filter(
    (t) =>
      t.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      t.id.toLowerCase().includes(termino.toLowerCase()) ||
      t.entidad.toLowerCase().includes(termino.toLowerCase())
  );

  if (!resultados.length) {
    return res.json({ ok: true, total: 0, data: [], mensaje: "No se encontraron resultados." });
  }

  res.json({ ok: true, total: resultados.length, data: resultados });
});

app.listen(PORT, () => {
  console.log(`Servidor GOB.PE corriendo en http://localhost:${PORT}`);
});
