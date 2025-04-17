
function Li(p){
    return(
        <li onClick={p.onClick}><a href={p.href}>{p.listName}</a></li>
    );
}

function Ul({children}){
    return(
        <ul>
            {children}
        </ul>
    );
}


export {Ul,Li};