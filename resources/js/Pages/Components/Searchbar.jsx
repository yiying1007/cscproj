


function Searchbar(p){

    return(
        <div>
            <input type="text" placeholder={p.placeholder} name="search" value={p.value} onChange={p.onChange} />
        </div>
    );
}



export default Searchbar;