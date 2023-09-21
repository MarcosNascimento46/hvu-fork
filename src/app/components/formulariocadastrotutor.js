import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from 'next/image'
import styles from "../components/formulariocadastrotutor.module.css";
import { ContinuarGreenButton } from "../green_button";

function FormularioCadastroTutor(){
    const [formularioTutor, setFormularioTutor] = useState({
        nome: "",
        email: "",
        senha: "",
        cpf: "",
        rg: "",
        telefone: "",
    });

    function handleInputChange(event){
        const { name, value } = event.target;
        setFormularioTutor({...formularioTutor, [name]: value});
    };

    function handleSubmit(event){
        event.preventDefault();
        console.log(formularioTutor);
    };

    return (
        <div className={`${styles.boxcadastrotutor} ${styles.container}`}>
    <form onSubmit={handleSubmit}>
        <div className="mb-3">
            <label htmlFor="nome" className="form-label">Nome Completo</label>
            <input
                type="text"
                className="form-control"
                name="nome"
                placeholder="Insira o nome completo"
                value={formularioTutor.nome}
                onChange={handleInputChange}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="email" className="form-label">E-mail</label>
            <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Insira o seu e-mail"
                value={formularioTutor.email}
                onChange={handleInputChange}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="senha" className="form-label">Senha</label>
            <input
                type="password"
                className="form-control"
                name="senha"
                placeholder="Insira uma senha"
                value={formularioTutor.senha}
                onChange={handleInputChange}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="cpf" className="form-label">CPF</label>
            <input
                type="text"
                className="form-control"
                placeholder="Ex:123.456.789-00"
                name="cpf"
                value={formularioTutor.cpf}
                onChange={handleInputChange}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="rg" className="form-label">RG</label>
            <input
                type="text"
                className="form-control"
                name="rg"
                placeholder="Insira o RG"
                value={formularioTutor.rg}
                onChange={handleInputChange}
            />
        </div>
        <div className="mb-3">
            <label htmlFor="telefone" className="form-label">Telefone para contato</label>
            <input
                type="tel"
                className="form-control"
                name="telefone"
                placeholder="(xx) xxxxx-xxxx"
                value={formularioTutor.telefone}
                onChange={handleInputChange}
            />
        </div>
        <div className={styles.continuarbotao}>
            <ContinuarGreenButton />
        </div>
    </form>
</div>

    )
}
export default FormularioCadastroTutor