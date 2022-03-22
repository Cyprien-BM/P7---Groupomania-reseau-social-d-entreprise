import axios from 'axios';

const INITIAL_STATE = {
  userData: {},
};

function userReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...state,
        state: action.payload,
        error: '',
      };
    }
    case 'REGISTER': {
      return {
        ...state,
        state: action.payload,
        error: '',
      }
    }
    case 'GET-USER': {
      return {
        ...state,
        userData: action.payload
      }
    }
    case 'USER-ERROR': {
      return {
        ...state,
        error: action.payload,
      };
    }
    default:
      return state;
  }
}

export default userReducer;

export const loginFunction = (user) => (dispatch) => {
  axios
    .post(
      `${process.env.REACT_APP_API_URL}api/auth/login`,
      {
        email: user.email,
        password: user.password,
      },
      { withCredentials: true }
    )
    .then(response => {
      dispatch({
        type: 'LOGIN',
        payload: response.data,
      });
    })
    .catch(error => {
      dispatch({
        type: 'USER-ERROR',
        payload: error.response.data.error,
      });
    });
};

export const registerFunction = (user) => (dispatch) => {
  axios
    .post(`${process.env.REACT_APP_API_URL}api/auth/signup`, {
      email: user.email,
      password: user.password,
      nickname: user.nickname,
    })
    .then(response => {
      dispatch({
        type: 'REGISTER',
        payload: response.data,
      });
    })
    .catch(e => {
      const error = e.response.data.error
      if(error.errors) {
        dispatch({
          type: 'USER-ERROR',
          payload: error.errors[0].message,
        });
      } else {
        dispatch({
          type: 'USER-ERROR',
          payload: error,
        });
      }
    });
};

export const getUserFunction = () => (dispatch) => {
  axios.get(`${process.env.REACT_APP_API_URL}api/profile/user`,
  { withCredentials: true })
  .then(response => {
    dispatch({
      type: 'GET-USER',
      payload: response.data,
    })
  })
}