import React from "react";

const Input = ({ name, label, value, onChange, type }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        autoFocus
        id={name}
        name={name}
        type={type}
        className="form-control"
        //ref={this.username}
      />
    </div>
  );
};

export default Input;
