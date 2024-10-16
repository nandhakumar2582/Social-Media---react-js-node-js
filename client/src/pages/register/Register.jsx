import { Link } from "react-router-dom";
import axios from "axios";
import { Alert } from 'antd';
import "./register.scss";
import { useState } from "react";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    name: ""
  });

  const [err, setErr] = useState(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleChange = (e) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/auth/register", inputs);
      setErr(null);
      setSuccessMessage(true);
    } catch (err) {
      setErr(err.response.data);
      setSuccessMessage(false);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Social Hub</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni totam, commodi laborum qui reiciendis doloribus deserunt itaque tempore atque consequatur</p>
          <span>Don't you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form>
            <input type="text" placeholder="Username" name="username" onChange={handleChange} />
            <input type="email" placeholder="Email" name="email" onChange={handleChange} />
            <input type="password" placeholder="Password" name="password" onChange={handleChange} />
            <input type="text" placeholder="Name" name="name" onChange={handleChange} />
            {err && <Alert message={err} type="error" showIcon />}
            {successMessage && <Alert message="Registration Successful" type="success" showIcon />}
            <button onClick={handleClick}>Register</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
