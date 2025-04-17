import { useState } from "react";


function ExpandableText ({ text, limit = 400 }){
    const [isExpanded, setIsExpanded] = useState(false);

    // show more
    const toggleExpand = () => setIsExpanded(!isExpanded);

    //follow user input change line
    const renderTextWithLineBreaks = (text) =>
        (text).split("\n").map((line, index) => (
          <p key={index} style={{ margin: "0" }}>
            {line}
          </p>
        ));

    return(
        <>
        {text!= null && (text.length > limit ? (
        <>
          {isExpanded ? renderTextWithLineBreaks(text) : renderTextWithLineBreaks(text.slice(0, limit) + "...")}
          <a 
            className="post-detail-btn"
            onClick={toggleExpand} 
            
          >
            {isExpanded ? "Show Less" : "Show More"}
          </a>
        </>
      ) : (
        renderTextWithLineBreaks(text)
      ))}
        </>
    );
}



export default ExpandableText ;