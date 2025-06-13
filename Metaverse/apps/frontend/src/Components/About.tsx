
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const About = () => {

    return (
        <div>
            <div style={{ width: '100vw', height: '100vh' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))', zIndex: '2' }}>
                    <h1 style={{ position: 'absolute', top: '100px', textAlign: 'center', width: '100%', color: 'rgb(117, 70, 222)', fontSize: '3rem' }}>Virtual Office: The Future of Remote Workspace</h1>
                    <h2 style={{ position: 'absolute', top: '220px', textAlign: 'center', width: '100%', color: 'rgb(117, 70, 222)', fontSize: '1.5rem' }}>Welcome to the world of Meta Presence and feel the future in the world of new experiences
                    </h2>
                </div>
                <video style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    objectFit: "cover"
                }}
                    autoPlay loop muted className="video">
                    <source src="/videos/office.mp4" type="video/mp4" />
                </video>
            </div>
            <div style={{ width: '100vw', height: '900px', backgroundColor: 'rgba(249,249,253,255)', marginTop: "100px" }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', position: 'relative', top: '150px', left: '144px', width: '83vw', height: '100%' }}>
                    <h1>Why? To Choose <br />Meta Presence Office</h1>
                    <div style={{ backgroundColor: 'white', borderRadius: '30px', marginTop: '-80px', boxShadow: '1px 3px 24px -9px', width: '50%', height: '350px', position: 'relative' }}>
                        <h1 style={{ fontSize: '2rem', textAlign: 'left', paddingLeft: '50px', color: '#666' }}>Communicate with Your Colleagues as You Would in the Real World.</h1>
                        <h3 style={{ fontSize: '1.2rem', textAlign: 'left', paddingLeft: '50px', color: 'rgb(162, 160, 160)' }}>Simply move your avatar near your colleagues and talk to them.<br /> You don’t need to create a meeting link every time.</h3>
                        <img style={{ width: '85%', marginLeft: '40px' }} src="/images/About1.png" alt="" />
                    </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', position: 'relative', top: '-355px', left: '144px', width: '83vw', height: '30%' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '30px', marginTop: '-80px', boxShadow: '1px 3px 24px -9px', width: '50%', height: '350px', position: 'relative' }}>
                        <h1 style={{ fontSize: '2rem', textAlign: 'left', paddingLeft: '50px', color: '#666' }}>You can message privately to your colleagues and no one can see them.</h1>
                        <h3 style={{ fontSize: '1.2rem', textAlign: 'left', paddingLeft: '50px', color: 'rgb(162, 160, 160)' }}>Simply move your avatar near your colleagues and talk to them.<br /> Tap on message Privately and now you can message.</h3>
                        <img style={{ width: '92%', position: 'absolute', top: '163px', height: '170px', marginLeft: '2px' }} src="/images/About2.png" alt="" />
                    </div>
                    <div style={{ overflow:'hidden',backgroundColor: 'white', borderRadius: '30px', marginTop: '-80px', boxShadow: '1px 3px 24px -9px', width: '45%', height: '350px', position: 'relative' }}>
                        <h1 style={{ fontSize: '2rem', textAlign: 'left', paddingLeft: '50px', color: '#666' }}>In room messages are limited to only room members.</h1>
                        <h3 style={{ fontSize: '1.2rem', textAlign: 'left', paddingLeft: '50px', color: 'rgb(162, 160, 160)' }}>If you are in a room in a map and you message something the message can only be seem by the users present in the room just like real world.</h3>
                        <img style={{ width: '92%', position: 'absolute', top: '163px', height: '200px', marginLeft: '2px' }} src="/images/About3.png" alt="" />
                    </div>
                </div>
            </div>
            <div style={{width:'100vw',height:'700px',backgroundColor:'rgba(39,38,46,255)'}}>
            <img style={{width:'150px',position:'relative',left:'40%',top:'-20px'}} src="./images/Logo1.png" alt="" />
            <h3 style={{position:'relative',top:'-80px',left:'40%',display:'inline',fontSize:'1.5rem',backgroundColor:'white',borderRadius:'13px',padding:'10px 20px'}}>OFFICE</h3>
            <h1 style={{color:'white',textAlign:'center'}}>Choose are OFFICE plan n the number of concurrent users
            and the features you need.</h1>
            <div style={{display:'flex',marginTop:'50px'}}>
                {/* Basic Plan */}
                <div style={{width:'300px',height:'350px',backgroundColor:'rgba(47,47,54,255)',borderRadius:'20px',marginLeft:'290px'}}>
                    <div style={{width:"75%",marginLeft:'50px',height:'100%'}}>
                        <h3 style={{color:'white',marginTop:'50px'}}>Basic Plan</h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Only 1 app can be installed
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Additional concurrent users possible
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Remove in-Space ADs
                        </h3>
                    </div>
                </div>
                
                {/* Pro Plan */}
                <div style={{width:'300px',height:'350px',backgroundColor:'rgba(47,47,54,255)',borderRadius:'20px',marginLeft:'20px'}}>
                    <div style={{width:"75%",marginLeft:'50px',height:'100%'}}>
                        <h3 style={{color:'white',marginTop:'50px'}}>Pro Plan</h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> URL, logo customization
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Premium features enabled
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Unlimited apps provided
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Google Analytics integration
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Data Report
                        </h3>
                    </div>
                </div>
                
                <div style={{width:'300px',height:'350px',backgroundColor:'rgba(47,47,54,255)',borderRadius:'20px',marginLeft:'20px'}}>
                    <div style={{width:"75%",marginLeft:'50px',height:'100%'}}>
                        <h3 style={{color:'white',marginTop:'50px'}}>Enterprise Plan</h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Enterprise-exclusive server provided
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Dedicated manager assigned
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Adjust channeling
                        </h3>
                        <h3 style={{color:'#aaa',display:'flex',alignItems:'center',gap:'10px',fontSize:'16px'}}>
                            <CheckCircleIcon style={{color:'#4CAF50',fontSize:'20px'}}/> Other features are available through negotiation
                        </h3>
                    </div>
                </div>
            </div>
        </div>
        </div>
    )

}

export default About;