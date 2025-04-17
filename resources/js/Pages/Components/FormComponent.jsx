

function Input(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <input className="formInput" type={p.type} name={p.name} id={p.id} value={p.value} onChange={p.onChange} disabled={p.disabled} />
        </div>
    );
}
function ProfileInput(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <input className="profileFormInput" type={p.type} name={p.name} id={p.id} value={p.value} onChange={p.onChange} disabled={p.disabled} />
        </div>
    );
}
function ProfileTextArea(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <textarea className="profileFormInput" style={{minHeight:"80px"}} type={p.type} name={p.name} id={p.id} value={p.value} onChange={p.onChange} disabled={p.disabled}></textarea>
        </div>
    );
}
function TextArea(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <textarea className="formInput" style={{minHeight:"50px"}} type={p.type} name={p.name} id={p.id} value={p.value} onChange={p.onChange} disabled={p.disabled}></textarea>
        </div>
    );
}
function Button(p){
    return(
        <div>
            <button className="buttonStyle" type="submit" disabled={p.disabled} onClick={p.onClick}>{p.name}
                
            </button>
        </div>
    );
}

function InfoMessage(p){
    return(
        <div>
            <p className={p.className}>{p.message}</p>
        </div>
    );
}

function Option(p){
    return(
        <option value={p.value} disabled={p.disabled}>{p.label}</option>
    );
}
function Select(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <select className="formInput" name={p.name} id={p.id} value={p.value} onChange={p.onChange}>
                {p.children}
            </select>
        </div>
    );
}
function ProfileSelect(p){
    return(
        <div className="sectionForm">
            <label className="formLabel">{p.label}</label>
            <select className="profileFormInput" name={p.name} id={p.id} value={p.value} onChange={p.onChange}>
                {p.children}
            </select>
        </div>
    );
}
export {Input,Button,InfoMessage,Select,Option,TextArea,ProfileInput,ProfileSelect,ProfileTextArea};