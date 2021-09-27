const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const { Pool } = require("pg");
const Postgres = new Pool({ ssl: { rejectUnauthorized: false } });

// Middlewares
app.use(express.json());

/* // Middleware to Lowercase
const transformName = (req, _res, next) => {
  req.body.name = req.body.name.toLowerCase();
  next();
};
// Middleware to check if hero already exists before add
const checkHeroAdd = async (req, res, next) => {
  const newHero = req.body;
  const superhero = await Superhero.findOne({
    name: new RegExp(newHero.name, "i"),
  });
  if (superhero) {
    return res.json({
      message: "Ce héros existe déjà !",
    });
  } else {
    return next();
  }
};
// Middleware to check if hero already exists before delete
const checkHeroRemove = async (req, res, next) => {
  const heroToRemove = req.params;

  const superhero = await Superhero.findOne({
    name: new RegExp(heroToRemove, "i"),
  });

  if (superhero) {
    return next();
  } else {
    return res.json({
      message: "Ce héros n'existe pas !",
    });
  }
}; */

// ROUTES
//Global
app.get("/", (_req, res) => {
  res.json({
    message: "OK",
  });
});

// All heroes
app.get("/heroes", async (_req, res) => {
  try {
    const superheroes = await Postgres.query("SELECT * FROM heroes");
    res.json({
      status: "OK",
      data: superheroes.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});
// Add Hero
app.post(
  "/heroes",
  /* transformName, checkHeroAdd, */ async (req, res) => {
    try {
      const newHero = await Postgres.query(
        "INSERT INTO heroes(name, power, color, is_alive, age, image) VALUES($1, $2, $3, $4, $5, $6)",
        [
          req.body.name,
          req.body.power,
          req.body.color,
          req.body.is_alive,
          parseInt(req.body.age),
          req.body.image,
        ]
      );

      return res.json({
        message: "Ok, héros ajouté",
      });
    } catch (err) {
      res.json({
        message: err,
      });
    }
  }
);

// Hero by name
app.get("/heroes/:name", async (req, res) => {
  const selectedHero = req.params.name;

  try {
    const superhero = await Postgres.query(
      "SELECT * FROM heroes WHERE name=$1",
      [selectedHero]
    );
    res.json({
      status: "OK",
      data: superhero.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});
// Delete Hero
app.delete(
  "/heroes/:name",
  /* checkHeroRemove, */ async (req, res) => {
    const selectedHero =
      req.params.name.charAt(0).toUpperCase + req.params.name.slice(1);
    try {
      await Postgres.query("DELETE FROM heroes WHERE name=$1", [selectedHero]);
      res.json({
        message: `${selectedHero} successfully removed`,
      });
    } catch (err) {
      res.json({
        message: err,
      });
    }
  }
);
// Replace Hero
app.put("/heroes/:name", async (req, res) => {
  const superheroName =
    req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1);
  const newHero = req.body;

  try {
    await Postgres.query(
      "UPDATE heroes SET name=$1, power=$2, color=$3, is_alive=$4, age=$5, image=$6",
      [
        newHero.name,
        newHero.power,
        newHero.color,
        newHero.is_alive,
        newHero.age,
        newHero.image,
      ]
    );
    res.json({
      message: `${superheroName} a bien été remplacé`,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

// Hero's power
app.get("/heroes/:name/power", async (req, res) => {
  const superhero =
    req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1);

  try {
    const powers = await Postgres.query(
      "SELECT power FROM powers JOIN heroes ON heroes_id=heroes.id  WHERE heroes.name=$1",
      [superhero]
    );

    res.json({
      status: "Here are your superhero's powers",
      data: powers.rows,
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});
// Add new power
app.patch("/heroes/:name/power", async (req, res) => {
  const superhero =
    req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1);
  const newPower = req.body.power;

  try {
    const superheroId = await Postgres.query(
      "SELECT id FROM heroes WHERE name=$1",
      [superhero]
    );

    await Postgres.query(
      "INSERT INTO powers(power, heroes_id) VALUES($1, $2)",
      [newPower, superheroId.rows[0].id]
    );
    res.json({
      message: "Pouvoir ajouté !",
    });
  } catch (err) {
    res.json({
      message: err,
    });
  }
});

// Delete a power
app.delete("/heroes/:name/power/:power", async (req, res) => {
  const powerToRemove = req.params.power.toLowerCase();

  await Postgres.query("DELETE FROM powers WHERE power=$1", [powerToRemove]);

  res.json({
    message: "Pourvoir supprimé !",
    data: powerToRemove,
  });
});

// Listening Port
app.listen(process.env.PORT, () => {
  console.log("Listening on port 5000");
});
