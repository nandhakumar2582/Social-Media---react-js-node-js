import './navbar.scss'
import { SunFilled, MoonFilled, SearchOutlined, BellFilled, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../../context/darkModeContext';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/authContext';
import { Input } from 'antd';
import { Button, Dropdown, Space } from 'antd';

const Navbar = () => {
  const {toggle, darkMode} = useContext(DarkModeContext)
  const {currentUser, logout} = useContext(AuthContext)
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (searchTerm.trim() !== '') {
      navigate(`/search?q=${searchTerm}`); 
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <div onClick={()=>navigate(`/profile/${currentUser.id}`)}>
           <UserOutlined /> <span>Profile</span>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div onClick={()=>logout()}>
          <LogoutOutlined /> <span>Logout</span>
        </div>
      ),
    },
  ];

  return (
    <div className='navbar'>
        <div className="left">
          <Link to= "/" style={{textDecoration: "none"}}>
             <span>Social Hub</span>
          </Link>
        </div>
        <div className="middle">
              <Input type="search" className='search' placeholder='Search' suffix={<SearchOutlined />} value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch} />
          </div>
        <div className="right">
          {darkMode? <SunFilled className='icon' onClick={toggle}/>: <MoonFilled className='icon' onClick={toggle}/>}
          <BellFilled className='icon' />
          <Dropdown
            placement='bottom'
            arrow
            menu={{
              items
            }}
          >
           <div className="user" onClick={()=>navigate(`/profile/${currentUser.id}`)}>
            <img src={currentUser.profilePic?currentUser.profilePic:"./images/default_profilePic.jpg"} />
            <span>{currentUser.name}</span>
          </div> 
         </Dropdown>
        </div>
    </div>
  )
}

export default Navbar