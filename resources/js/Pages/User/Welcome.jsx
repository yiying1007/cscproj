import { Input,Button,InfoMessage } from "../Components/FormComponent";
import { UserWelcomeLayout } from "../../../Layouts/GuestLayout";
import { Link,useForm } from "@inertiajs/react";
import { useEffect } from "react";
function Welcome(){
    useEffect(() => {
        const elements = document.querySelectorAll(".welcome-border");
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("show");
            }
          });
        });
    
        elements.forEach((el) => observer.observe(el));
    
        return () => observer.disconnect(); // 清理观察器
      }, []);
    return(
        <UserWelcomeLayout>
            
            <div className="welcome-border">
                <div className="welcome-border-left">
                    <h3>Welcome to SEGiSpace</h3>
                    <p>
                        SEGiSpace  is a social community platform designed specifically for SEGi College Penang.
                        
                    </p>
                    <Link className="welcome-btn"  href={route('user.login')}>
                        Join Us
                    </Link>
                </div>
                <div className="welcome-border-right">
                    <img className="img-w1" src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel1.gif" />
                </div>
            </div>
            <div className="welcome-border">
                <div className="welcome-border-left">
                    <h3>About SEGiSpace</h3>
                    <p>
                        SEGiSpace aims to provide campus users with a comprehensive space that integrates information sharing, social interaction, and event organization, making campus life more convenient and engaging.
                    </p>
                </div>
                <div className="welcome-border-right">
                    <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel4.gif" />
                </div>
            </div>
            <div className="welcome-border">
                <div className="welcome-border-left" >
                    <h3>Got Campus Questions? Hosting Events? Need Tips? </h3>
                    <p>
                    Whether you need academic help, want to announce an event, share the campus life, or look for useful guides, SEGiSpace is the place to share and explore it all!
                    </p>
                </div>
                <div className="welcome-border-right">
                <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel2.gif" />
                </div>
            </div>
            <div className="welcome-border">
                <div className="welcome-border-left" >
                    <h3>Real-time Chat, Campus Connection!</h3>
                    <p>
                        Chat with your friends, share your campus life, and have fun!
                    </p>
                </div>
                <div className="welcome-border-right">
                <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel5.gif" />
                </div>
            </div>
            <div className="welcome-border">
                <div className="welcome-border-left" >
                    <h3>Build Your Passion Community</h3>
                    <p>
                        Discover groups based on your interests and connect with like-minded students instantly.
                    </p>
                </div>
                <div className="welcome-border-right">
                <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel6.gif" />
                </div>
            </div>
            <div className="welcome-border">
                <div className="welcome-border-left">
                    <h3>SEGi College Penang - Exclusive </h3>
                    <p>
                    SEGiSpace requires campus identity verification, allowing only SEGi members to join.
                    </p>
                    <p>
                    Stay connected in a safe and private space.
                    </p>
                </div>
                <div className="welcome-border-right">
                <img src="https://fypcscproject.s3.ap-southeast-1.amazonaws.com/otherImage/wel3.gif" />
                </div>
            </div>
            
            
            
        </UserWelcomeLayout>

    );
}

export default  Welcome; 

