import React, { useState } from "react";
import { GoogleOAuthProvider} from "@react-oauth/google";

import { useNavigate } from "react-router-dom";
import MetaPresenceLoading from "./MetaPresenceLoading";
const GOOGLE_CLIENT_ID = "689126264395-mqkr9144r9nbhhbldrbrejeequtaf4fu.apps.googleusercontent.com"; // Replace with your Google Client ID

const Signup: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [type,setRole]= useState("User");
    const [loading,setLoading]=useState(false);
    const Navigate = useNavigate();
    const handleSignup = async (e: React.MouseEvent) => {
        setLoading(true);
        e.preventDefault();  // Add this to prevent form submission
      
            console.log(username);
            console.log(password);
            console.log(type);
    
            const response = await fetch(`https://metapresense.onrender.com/api/v1/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    type,
                }),
            });
    
            
            if(response.status==200){
                const data = await response.json();
                alert("Signup successful! UserId: " + data.userId);  // Changed to match backend response
                console.log("User ID:", data.userId);
                Navigate('/login');
                setLoading(false);
            }
            else{
                const data= await response.json();
                console.log(data.Message)
                alert(data.Message);
                setLoading(false);
            }
    };
    
    if (loading) {
        return (
          <MetaPresenceLoading/>
        );
      }
   

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div style={{ display: 'flex', textAlign: 'center', width: "100vw", height: "100vh" }} >
                <div style={{ display: "flex", alignItems: 'center', textAlign: "left", justifyContent: 'center', flexDirection: 'column',width:'535px' }}>
                    <div style={{width:'303px'}}>
                        <h1 style={{position:"absolute",left:"30px",top:'0px'}}>Meta Presence</h1>
                        <h2 style={{marginBottom:'20px'}}>Welcome Back!</h2>
                        <p style={{marginBottom:'30px'}}>Already have an account? <a href="/login" className="text-blue-500">We got you Login here.</a> Take less than a minute.</p>
                        <form  style={{ display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: 'center' ,marginBottom:"30px"}} className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{ width: '300px', height: '30px', marginBottom: '15px' }}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '300px', height: '30px', marginBottom: '15px' }}
                                required
                            />
                            <select
                                value={type}
                                onChange={(e) => setRole(e.target.value)}
                                style={{width:"311px",backgroundColor:'white',color:'black',height:'40px',border:"1px solid black"}}
                                required
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                            <button style={{marginTop:'20px',width:"311px",height:"40px",color:'white',backgroundColor:'black'}} onClick={handleSignup} type="submit">
                                Signup Now
                            </button>
                        </form>



                        <p className="text-center text-gray-500 text-sm mt-6">© 2025 Meta Presence. All rights reserved.</p>
                    </div>
                </div>
                <div style={{ display: "flex", height: "100vh", overflow: 'hidden' }}>
                    {/* <div style={{position:"absolute",height:'100%',width:"63.8%",zIndex:"0",backgroundColor:'black',opacity:'0.3'}}></div> */}
                    <div style={{ width: "1000px", height: '100%', position: "relative", backgroundImage: "url(/images/login-back.jpg", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                        <div className="video-background" style={{ position: "absolute", top: "360px", left: "194px", width: "62%", height: "43%", overflow: "hidden", zIndex: '0', borderRadius: "20px", boxShadow: '5px 6px 22px 5px black' }}>
                            <video style={{
                                width: "101%",
                                height: "100%",
                                position: "relative",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                objectFit: "cover"
                            }}
                                autoPlay loop muted className="video">
                                <source src="/videos/landing_2.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div style={{ marginTop: '100px' }}>
                            <h1 >Hello Meta Man®</h1>
                            <h2 >Welcome to world of Metaverse</h2>
                            <p>Skip the boring online video meetings and make your work liffe more engaging wiht us.</p>
                        </div>

                    </div>

                </div>
            </div>
        </GoogleOAuthProvider >
    );
};

export default Signup;