
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
const Home = () => {
    return (
        <div>
            <div style={{ width: '100vw', height: '100vh' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))', zIndex: '2' }}>
                    <h1 style={{ position: 'absolute', top: '100px', textAlign: 'center', width: '100%', color: 'rgb(117, 70, 222)', fontSize: '4rem' }}>Welcome MetaMan!</h1>
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
                    <source src="/videos/landing_2.mp4" type="video/mp4" />
                </video>
            </div>
            <div style={{ width: '100vw', height: '700px', backgroundColor: '#f8f9fc' }}>
                <h1 style={{ width: "100vw", position: 'relative', textAlign: "center", top: '100px' }}>Maps you can order to explore</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', position: 'relative', top: '150px', left: '144px', width: '83vw' }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Conference.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(155,152,137,1) 0%,rgba(155,152,137,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Conference map
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/office.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(219,209,208,1) 0%, rgba(219,209,208,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'Black',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Office Map
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Camping.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(41,73,52,1) 0%, rgba(41,73,52,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Camping Map
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Institute.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(93,80,64,1) 0%, rgba(93,80,64,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Institute Map
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/study.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Your Text Here
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Work.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Your Text Here
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Winter fun.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Your Text Here
                        </div>
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            width: '250px',
                            height: '130px',
                            margin: '30px',
                            overflow: 'hidden'  // Important for containing the overlay
                        }}
                    >
                        <img
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            src="/images/Boxing.jpg"
                            alt=""
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(to right, rgba(48,71,103,1) 0%, rgba(48,71,103,0.3) 100%)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '20px',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                            Boxing Map
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', height: '500px', width: '100vw', alignItems: 'center' }}>
                <div style={{ width: '50%' }}>
                    <h1 style={{ textAlign: 'center' }}>Choose your own character</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50%', height: '100%' }}>
                    <div style={{ width: '80%', height: '70%', borderRadius: '30px', boxShadow: '1px 3px 24px -9px', backgroundColor: '#f8f9fc', display: 'flex', alignItems: 'center' }}>
                        <img style={{ width: '100%' }} src="/images/charactes.png" alt="" />
                    </div>
                </div>
            </div>
            <div style={{ width: '100vw', height: '120vh', backgroundColor: '#f8f9fc' }}>
                <h1 style={{ width: '100vw', textAlign: 'center', paddingTop: '60px' }}>How you can access a Map</h1>
                <div style={{ position: 'absolute', display: 'flex', width: '100vw', height: '93%', justifyContent: 'space-evenly' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '30px', marginTop: '50px', boxShadow: '1px 3px 24px -9px', width: '40%', height: '90%', position: 'relative' }}>
                        <h1 style={{ width: '100%', textAlign: 'center', paddingTop: '50px' }}>Either choose a Tempelate</h1>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Check out our templates, which include Spaces for<br /> offices, events, and community gatherings.</p>
                        <img style={{ width: '90%', position: 'relative', top: '80px' }} src="/images/temp.avif" alt="" />
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '30px', marginTop: '50px', boxShadow: '1px 3px 24px -9px', width: '40%', height: '90%', position: 'relative' }}>
                        <h1 style={{ width: '100%', textAlign: 'center', paddingTop: '50px' }}>Either creates a new map By adding Elements</h1>
                        <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>You can design anything you can imagine in Meta Presence.</p>
                        <img style={{ width: '90%', position: 'relative', top: '70px' }} src="/images/draw.avif" alt="" />
                    </div>
                </div>
            </div>
            <div style={{ width: '100vw', height: '700px', backgroundColor: 'rgba(39,38,46,255)',zIndex:'-2' }}>
                <img style={{width:'500px',position:'absolute'}} src="/images/leo.png" alt="" />
                <img style={{width:'500px',position:'absolute',left:'1000px',marginTop:'40px'}} src="/images/olivia.png" alt="" />
                <img style={{width:'500px',position:'absolute',marginTop:'415px'}} src="/images/Rio.png" alt="" />
                <img style={{width:'500px',position:'absolute',left:'1030px',marginTop:'400px'}} src="/images/jadoo.png" alt="" />
                <h1 style={{ color: "white", width: '100vw', textAlign: 'center', paddingTop: '150px' }}>Any Querry? Need help then contact us</h1>
                <form style={{position:'absolute'}}>
                    <textarea style={{width:'700px',height:'300px',backgroundColor:'#f8f9fc',position:'relative',top:'94px',left:'333px',borderRadius:'20px',fontSize:'1.2rem',padding:'20px'}} id="paragraphInput" placeholder="Type your paragraphs here..."></textarea>
                    <br/>
                        <ArrowForwardIcon style={{position:'relative',top:'-67px',left:'1150px',fontSize:'2rem',color:'white',cursor:'pointer'}}/>
                </form>
            </div>
        </div>
    )
}

export default Home;