import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllComments,
  postAComment,
  deleteCommentFunction,
} from '../../redux/comments/commentsReducer';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import './Comment.css';
import deleteCommentLogo from '../../Assets/logo/cross.svg';
import editCommentLogo from '../../Assets/logo/pen.png';

export default function Comment(props) {
  const contentRef = useRef();
  const imgRef = useRef();
  const inputRef = useRef();
  const dispatch = useDispatch();

  const commentState = useSelector((state) => state.commentsReducer);
  const userState = useSelector((state) => state.userReducer);

  const [comment, setComment] = useState({
    content: '',
    imageUrl: '',
  });

  // Get all states after page load
  useEffect(() => {
    if (commentState.comments.length === 0) {
      dispatch(getAllComments());
    }
  }, []);
  //----------------------------------------------//

  //Data binding beetween state comment and form
  const handleInputs = (event) => {
    if (event.target.classList.contains('post-comments_form-img-input')) {
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      imgRef.current.src = previewUrl;
    } else if (event.target.classList.contains('comment-input')) {
      const newCommentState = { ...comment, content: event.target.value };
      setComment(newCommentState);
    }
  };
  //---------------------------------------------//

  // Resize text-area
  function autoGrow(e) {
    const target = e.target;
    contentRef.current.style.height = '50px';
    contentRef.current.style.height = target.scrollHeight + 'px';
    handleInputs(e);
  }

  function loseFocus(e) {
    let commentRegex = /[\w\d]/g;
    if (!commentRegex.test(e.target.value)) {
      contentRef.current.style.height = '30px';
      contentRef.current.value = '';
    }
  }
  //---------------------------------------------//

  //Create / Delete comment
  const submitForm = (event) => {
    event.preventDefault();
    dispatch(postAComment(comment, event.target[1].files[0], props.postId));
  };

  const deleteComment = (id) => {
    const answer = window.confirm(
      'Etes vous sûr de vouloir supprimer ce commentaire ?'
    );
    if (answer) {
      dispatch(deleteCommentFunction(id));
    }
  };
  //---------------------------------------------//

  //Update comment state after any creation or modification and clean image preview
  useEffect(() => {
    if (
      commentState.status === 'Commentaire modifié' ||
      commentState.status === 'Commentaire Créé'
    ) {
      dispatch({ type: 'CLEAN-COMMENT-STATUS' });
      imgRef.current.src = '';
      inputRef.current.value = '';
    }
  }, [commentState.status, dispatch]);
  //---------------------------------------------//

  // Timer for display error when trying to comment
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (commentState.error !== '') {
      setVisible(!visible);
      const timer = setTimeout(() => {
        setVisible(false);
        dispatch({ type: 'COMMENT-CLEAN-ERROR' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [commentState.error]);
  //---------------------------------------------//

  // Create each comment for a post
  const renderComment = () => {
    let postComment = commentState.comments.filter(
      (comment) => comment.postId === props.postId
    );
    let commentArray = [];
    postComment.forEach((comment) => {
      commentArray.push(
        <div className='post-comment' key={uuidv4()}>
          <div className='comment-header'>
            <div className='comment-header-user-data'>
              <img
                src={comment.user.pictureUrl}
                alt='Photo de profil du créateur du commentaire'
                className='comment-profile-img'
              />
              <p className='comment-created-info'>
                <strong>
                  <Link
                    className='post-user-link'
                    onClick={(event) => event.stopPropagation()}
                    to={`/user/${comment.user.idUSER}`}
                  >
                    {comment.user.nickname}
                  </Link>
                </strong>{' '}
                le
                {' ' +
                  moment(comment.createdAt).format('Do MMMM YYYY, H:mm:ss')}
              </p>
            </div>
            {userState.userData.idUSER === comment.userId ||
            userState.userData.isAdmin ? (
              <div className='edit-comment-container'>
                <img
                  src={editCommentLogo}
                  alt='Editer le post'
                  className='edit-comment-img'
                  onClick={() => props.toggleCommentModal(comment.commentId)}
                />
                <img
                  src={deleteCommentLogo}
                  alt='Supprimer le post'
                  className='edit-comment-img'
                  onClick={() => deleteComment(comment.commentId)}
                />
              </div>
            ) : (
              ''
            )}
          </div>
          <p>{comment.content}</p>
          {comment.imageUrl && (
            <a
              href={comment.imageUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              <img
                className='comment-img'
                src={comment.imageUrl}
                alt='Image du commentaire'
              />
            </a>
          )}
        </div>
      );
    });
    return commentArray;
  };
  //---------------------------------------------//

  return (
    <div className='post-comments-container'>
      <form onSubmit={submitForm} action=''>
        <label className='post-comments_content-label'>
          Ajouter un commentaire ?
          <textarea
            ref={contentRef}
            onInput={autoGrow}
            onBlur={loseFocus}
            className='comment-input'
            placeholder='Envie de commenter ?'
            value={comment.content}
          ></textarea>
        </label>

        <div className='post-comments_file-and-btn-container'>
          <div className='post-comments_file-container'>
            <label className='post-comments_file-label'>
              Ajouter une photo ?
              <input
                onInput={handleInputs}
                type='file'
                className='post-comments_form-img-input'
                accept='.jpeg, .jpg, .png, .gif'
                name='image'
                ref={inputRef}
              />
            </label>
          </div>
          <button className='btn-component post-comment-button'>Envoi</button>
        </div>
        <img src='' alt='' className='post-comments-img_preview' ref={imgRef} />
        {visible && <p className='form-error'>{commentState.error}</p>}
      </form>
      <>{renderComment()}</>
    </div>
  );
}
