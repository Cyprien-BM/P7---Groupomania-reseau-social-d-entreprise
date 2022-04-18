const db = require('../models');
const bcrypt = require('bcrypt');
// const multer = require('../middleware/multer-profile');
const fs = require('fs');

const User = db.users;
const Post = db.posts;
const Like = db.like;

exports.getUser = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: res.locals.id,
    },
    raw: true,
  })
    .then((user) => res.status(200).json(user))
    .catch((error) => res.status(400).json({ error }));
};

exports.getUserById = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: req.params.id,
    },
    raw: true,
  })
    .then((user) => {
      res.status(200).json({ user, otherUser: true });
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getUserLike = (req, res, next) => {
  Like.findAll({
    attributes: ['likeValue', 'postId'],
    where: {
      userId: res.locals.id,
    },
    raw: true,
  })
    .then((like) => {
      res.status(201).json(like);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.modifyPassword = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: req.params.id,
    },
  })
    .then((user) => {
      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          user
            .update({
              password: hash,
            })
            .then(() =>
              res.status(200).json({ message: 'Mots de passe modifié !' })
            )
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.modifyUserInformation = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: req.params.id,
    },
    raw: true,
  })
    .then((user) => {
      let imgUrl;
      if (req.file) {
        const fileName = user.pictureUrl.split('/images/')[1];
        if (fileName != 'Default.png') {
          fs.unlink(`image/profile/images/${fileName}`, (error) => {
            error;
          });
        }
        imgUrl = `${req.protocol}://${req.get('host')}/image/profile/images/${
          req.file.filename
        }`;
      } else {
        imgUrl = req.body.pictureUrl;
      }
      User.update(
        {
          nickname: req.body.nickname,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          pictureUrl: imgUrl,
          email: req.body.email,
        },
        {
          where: {
            idUSER: res.locals.id,
          },
        }
      )
        .then(() => res.status(200).json({ message: 'Profil modifié !' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.deleteUser = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: req.params.id,
    },
  })
    .then(async (user) => {
      const fileName = user.pictureUrl.split('/images/')[1];
      if (fileName != 'Default.png') {
        fs.unlink(`image/profile/images/${fileName}`, (error) => {
          error;
        });
      }

      // Find all posts related to the user and delete all image file associated to them before cascade deletion
      await Post.findAll({
        where: {
          userId: req.params.id,
        },
      })
        .then((posts) => {
          for (const post of posts) {
            if (post.imageUrl != null) {
              const fileName = post.imageUrl.split('/images/')[1];
              fs.unlinkSync(`image/profile/images/${fileName}`, (error) => {
                error;
              });
            }
          }
        })
        .catch((error) => res.status(502).json({ error }));

      // Delete user
      User.destroy({
        where: {
          idUSER: req.params.id,
        },
      })
        .then(() => {
          req.session.destroy();
          res.clearCookie('connect.sid');
          res.status(201).json({ message: 'Utilisateur Supprimé' });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => res.status(502).json({ error }));
};

exports.deleteImageUser = (req, res, next) => {
  User.findOne({
    where: {
      idUSER: req.params.id,
    },
  })
    .then(async (user) => {
      const fileName = user.pictureUrl.split('/images/')[1];
      if (fileName != 'Default.png') {
        fs.unlink(`image/profile/images/${fileName}`, (error) => {
          error;
        });
      }
      user
        .update({
          pictureUrl: `${req.protocol}://${req.get(
            'host'
          )}/image/profile/Default.png`,
        })
        .then(() => res.status(200).json({ message: 'Image supprimé' }))
        .catch((error) =>
          res.status(400).json({ message: 'Impossible de supprimer l\'image' })
        );
    })
    .catch(() => res.status(500).json({ message: 'Utilisateur introuvable' }));
};
