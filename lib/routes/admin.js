const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");

//handle authentication. Protect routes
const requireAuthentication = (req, res, next) => {
 // Express headers are auto converted to lowercase
  let token =  req.session.token;
  //   console.log(token);

  if (token) {
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).redirect('/auth/login')
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(400).redirect('/auth/login')
  }
};

const {
  ImagesModel,
  ProjectModel,
  CompanyModel,
  UserModel,
} = require("../models");
const multer = require("multer");
const path = require("path");

//setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../assets/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

router.get("/", requireAuthentication, async (req, res) => {
  const images = await ImagesModel.findAll({
    where: {
      category: null,
    },
    attributes: ["id", "name"],
  });
  const company = await CompanyModel.findOne({
    attributes: [
      "name",
      "tagline",
      "box",
      "mobile",
      "email",
      "history",
      "vision",
      "mission",
      "objective",
    ],
  });
  res.render("admin", {
    images: images.map((image) => image.toJSON()),
    company: company.toJSON(),
  });
});

//update requests
router.put("/company", (req, res) => {
  CompanyModel.update(req.body, {
    where: {
      id: parseInt(req.body.id),
    },
  })
    .then((update) => res.status(301).redirect("/admin"))
    .catch((err) => console.error());
});

router.post("/company", (req, res) => {
  // new CompanyModel(company).save().then(onFulfill => console.log(company)).catch(err =>console.error(err))
});

router.put("project", (req, res) => {
  ProjetModel.update(req.body, {
    where: {
      id: req.body.id,
    },
  })
    .then()
    .catch((err) => console.error(err));
});

//post requests
router.post("/project", upload.single("avatar"), (req, res) => {
  req.body.image = req.file.originalname;
  new ProjectModel(req.body)
    .save()
    .then(() => res.status(201).redirect("/admin"))
    .catch((err) => console.error(err));
});

router.post("/images/finish", upload.single("avatar"), (req, res) => {
  req.body.name = req.file.originalname;
  req.body.classification = "finishes";
  req.body.projectId = 1;

  new ImagesModel(req.body)
    .save()
    .then((fulfill) => res.redirect("/admin"))
    .catch((err) => console.error(err));
});

router.put("/images", (req, res) => {
  ImagesModel.update(req.body, {
    where: {
      id: parseInt(req.body.id),
    },
  })
    .then(() => res.status(201))
    .then(() => res.redirect("/admin"))
    .catch((err) => console.error(err));
});

router.delete("/image/:id", (req, res) => {
  console.log(req.params);

  ImagesModel.destroy({
    where: {
      id: parseInt(req.params.id),
    },
  }).then(() =>
    res.status(301).json({
      message: "deleted",
    })
  );
});

router.post("/images", (req, res) => {});

//send an email
router.post("/mail", (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.password,
    },
  });

  const mailOptions = {
    from: process.env.email,
    to: req.body.email,
    subject: `inquiry from ${req.body.name}`,
    text: req.body.message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      res.redirect("/contact");
    }
  });
});


router.post('/logout',(req, res)=>{
    console.log(req.session.token);
    
    req.session.destroy(err=>{
        
    })

    res.send('okay')
})
module.exports = router;
