import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Select from "react-select";
import styles from "./index.module.css";
import VoltarButton from "../VoltarButton";
import { CancelarWhiteButton } from "../WhiteButton";
import {
  getAllAnimalTutor,
  getRetornoByAnimalId,
} from "../../../services/animalService";
import { getAllVaga } from "../../../services/vagaService";
import {
  createAgendamento,
  getDatasNaoPodeAgendar,
} from "../../../services/agendamentoService";
import { getCurrentUsuario } from "../../../services/userService";
import Alert from "../Alert";
import ErrorAlert from "../ErrorAlert";
import Image from "next/image";

const HorariosSemana = () => {
  const router = useRouter();

  const [selecionarData, setSelecionarData] = useState(new Date());
  const [selecionarHorario, setSelecionarHorario] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [animais, setAnimais] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  const [vagas, setVagas] = useState(null);
  const [selectedVaga, setSelectedVaga] = useState(null);

  const [retorno, setRetorno] = useState("");

  const [datasProibidas, setDatasProibidas] = useState([]);
  const [tutorId, setTutorId] = useState(null);

  const [errors, setErrors] = useState({});

  const [showAlert, setShowAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  console.log("retorno:", retorno);
  console.log("selectedAnimal:", selectedAnimal);
  console.log("datasProibidas:", datasProibidas);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      const storedRoles = JSON.parse(localStorage.getItem("roles"));
      setToken(storedToken || "");
      setRoles(storedRoles || []);
    }
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const diasSemana = {
    0: "Domingo",
    1: "Segunda",
    2: "Terça",
    3: "Quarta",
    4: "Quinta",
    5: "Sexta",
    6: "Sábado",
  };

  const handleDateChange = (date) => {
    setSelecionarData(date);
  };

  // Função para avançar uma semana
  const avancarSemana = () => {
    const proximaSemana = new Date(selecionarData);
    proximaSemana.setDate(proximaSemana.getDate() + 7);
    setSelecionarData(proximaSemana);
  };

  // Função para retroceder uma semana
  const retrocederSemana = () => {
    const semanaAnterior = new Date(selecionarData);
    semanaAnterior.setDate(semanaAnterior.getDate() - 7);
    setSelecionarData(semanaAnterior);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const AnimaisData = await getAllAnimalTutor();
        setAnimais(AnimaisData);
      } catch (error) {
        console.error("Erro ao buscar animais:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const VagasData = await getAllVaga();
        setVagas(VagasData);
        console.log("VagasData:", VagasData);
      } catch (error) {
        console.error("Erro ao buscar vagas:", error);
      } finally {
        setLoading(false); // Marcar como carregado após buscar os dados
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUsuario();
        const datas = await getDatasNaoPodeAgendar(user.usuario.id);
        setDatasProibidas(datas);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const data = await getRetornoByAnimalId(selectedAnimal.id);
        if (isMounted) {
          setRetorno(data);
        }
      } catch (error) {
        console.error("Erro ao buscar status de retorno do animal:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [selectedAnimal]);

  const handleAnimalSelection = (event) => {
    const animalId = event.target.value;
    const selectedAnimalInfo = animais.find(
      (animal) => animal.id === parseInt(animalId)
    );
    setSelectedAnimal(selectedAnimalInfo);
  };

  const formatDate = (dateString, selectedTime) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = selectedTime ? ` às ${selectedTime}` : "";
    return formattedDate + formattedTime;
  };

  // Verifica se os dados estão carregando
  if (loading) {
    return <div className={styles.message}>Carregando dados do usuário...</div>;
  }

  // Verifica se o usuário tem permissão
  if (!roles.includes("tutor")) {
    return (
      <div className={styles.container}>
        <h3 className={styles.message}>
          Acesso negado: Você não tem permissão para acessar esta página.
        </h3>
      </div>
    );
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <h3 className={styles.message}>
          Acesso negado: Faça login para acessar esta página.
        </h3>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!selectedAnimal) {
      errors.selectedAnimal = "Selecione um animal";
    }
    if (!selectedVaga && !selectedAnimal) {
      errors.selectedAnimal = "Selecione um animal";
    }
    if (!selectedVaga && selectedAnimal) {
      errors.selectedAnimal = "Selecione uma vaga";
    }
    return errors;
  };

  const handleAgendar = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      openModal();
    }
  };

  const handleCreateAgendamento = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const agendamentoDate = new Date(selecionarHorario)
      .toISOString()
      .split("T")[0];

    const agendamentoToCreate = {
      animal: { id: selectedAnimal.id },
      dataVaga: selecionarHorario,
      status: "Agendado",
    };

    try {
      const newAgendamento = await createAgendamento(
        agendamentoToCreate,
        selectedVaga.id
      );
      setShowAlert(true);
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      setShowErrorAlert(true);
    }
  };

  const getNomeSobrenome = (nomeCompleto) => {
    if (!nomeCompleto) return "";
    const partes = nomeCompleto.split(" ");
    if (partes.length < 2) return nomeCompleto; // Se não houver sobrenome, retorna o nome completo

    // Inclui o artigo se ele fizer parte do segundo nome
    const segundoNome =
      ["da", "de", "do", "dos", "das"].includes(partes[1].toLowerCase()) &&
      partes.length > 2
        ? `${partes[1]} ${partes[2]}`
        : partes[1];

    return `${partes[0]} ${segundoNome}`; // Retorna o primeiro e o segundo nome (incluindo o artigo, se houver)
  };

  return (
    <div className={styles.container}>
      <div className={styles.voltar_button}>
        <VoltarButton />
      </div>

      <div className={styles.title_box}>
        <h1>Agendar Consulta</h1>
      </div>

      <div className={styles.boxprincipal}>
        <div className={styles.select_container}>
          <div className={styles.select_box}>
            <h1>
              Paciente <span className={styles.obrigatorio}>*</span>
            </h1>
            <select
              className={`form-select ${styles.input} ${
                errors.selectedAnimal ? "is-invalid" : ""
              }`}
              aria-label="Default select example"
              name="animal"
              value={selectedAnimal ? selectedAnimal.id : ""}
              onChange={handleAnimalSelection}
            >
              <option value="">Selecione um paciente</option>
              {animais &&
                animais.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nome}
                  </option>
                ))}
            </select>
            {errors.selectedAnimal && (
              <div className={`invalid-feedback ${styles.error_message}`}>
                {errors.selectedAnimal}
              </div>
            )}
          </div>
        </div>

        <h1 className={styles.titulodataconsulta}>Data da Consulta</h1>
        <h2
          className={`${styles.descricaotitulodataconsulta} ${
            errors.selectedVaga ? "is-invalid" : ""
          }`}
        >
          Selecione o dia e o horário disponível de sua preferência para o
          atendimento
        </h2>
        {errors.selectedVaga && (
          <div className={`invalid-feedback ${styles.error_message}`}>
            {errors.selectedVaga}
          </div>
        )}

        <div className={styles.legenda_box}>
          <div className={styles.legenda}>
            <h3>
              <Image src="/blue_rectangle.svg" width={15.73} height={15.73} />
            </h3>
            <h3>Primeira consulta</h3>
          </div>

          <div className={styles.legenda}>
            <h3>
              <Image src="/pink_rectangle.svg" width={15.73} height={15.73} />
            </h3>
            <h3>Consulta de retorno</h3>
          </div>
        </div>

        <div className={styles.button_voltar_avancar}>
          <button className={styles.button_voltar} onClick={retrocederSemana}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className={styles.button_avancar} onClick={avancarSemana}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div className={styles.containersemana}>
          {Array.from({ length: 7 }, (_, index) => {
            const currentDate = new Date(selecionarData);
            currentDate.setDate(
              currentDate.getDate() - currentDate.getDay() + index
            );
            if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {
              const currentDateFormatted = currentDate.toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "2-digit", year: "numeric" }
              );
              const vagasForCurrentDay =
                vagas &&
                vagas.filter((vaga) => {
                  const vagaDate = new Date(vaga.dataHora);
                  const vagaDateFormatted = vagaDate.toLocaleDateString(
                    "pt-BR",
                    { day: "2-digit", month: "2-digit", year: "numeric" }
                  );
                  return vagaDateFormatted === currentDateFormatted;
                });

              // Verifica se a data atual está na lista de datas proibidas
              const isDateProhibited = datasProibidas.some((dataProibida) => {
                const dataProibidaDate = new Date(
                  dataProibida
                ).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                return dataProibidaDate === currentDateFormatted;
              });

              if (!vagasForCurrentDay || vagasForCurrentDay.length === 0) {
                return (
                  <div key={currentDate} className={styles.containerdia}>
                    <h2 className={styles.diasdasemana}>
                      {diasSemana[currentDate.getDay()]}
                    </h2>
                    <p className={styles.data}>{currentDateFormatted}</p>
                    <div className={styles.no_vagas}>Não há vagas</div>
                  </div>
                );
              }

              return (
                <div key={currentDate} className={styles.containerdia}>
                  <h2 className={styles.diasdasemana}>
                    {diasSemana[currentDate.getDay()]}
                  </h2>
                  <p className={styles.data}>{currentDateFormatted}</p>
                  <div className="time-buttons">
                    {vagasForCurrentDay.map((vaga) => {
                      const vagaDate = new Date(vaga.dataHora);
                      const isPast = vagaDate < new Date();
                      const isProhibited =
                        isDateProhibited ||
                        vaga.status === "Agendado" ||
                        vaga.status === "Finalizado" ||
                        vaga.status === "Cancelado";

                      return (
                        <button
                          key={vaga.id}
                          className={
                            isPast || isProhibited
                              ? `${styles.botaohoraIndisponivel}`
                              : vaga.tipoConsulta &&
                                vaga.tipoConsulta.tipo === "Retorno"
                              ? `${styles.botaoRetorno} ${
                                  selectedVaga === vaga ? styles.selected : ""
                                }`
                              : `${styles.botaoPrimeiraConsulta} ${
                                  selectedVaga === vaga ? styles.selected : ""
                                }`
                          }
                          onClick={() => {
                            if (!isProhibited && !isPast) {
                              handleDateChange(currentDate);
                              setSelecionarHorario(vaga.dataHora);
                              setSelectedVaga(vaga);
                            }
                          }}
                          disabled={
                            isProhibited ||
                            !selectedAnimal ||
                            retorno.toLowerCase() !==
                              vaga.tipoConsulta.tipo.toLowerCase() ||
                            isPast
                          }
                        >
                          {vaga.dataHora
                            .split("T")[1]
                            .split(":")
                            .slice(0, 2)
                            .join(":")}
                          <br />
                          {vaga.tipoConsulta ? vaga.tipoConsulta.tipo : ""}
                          {vaga.tipoConsulta &&
                            vaga.tipoConsulta.tipo === "Retorno" && (
                              <>
                                <br />
                                {vaga.medico
                                  ? getNomeSobrenome(vaga.medico.nome)
                                  : ""}
                              </>
                            )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        <div className={styles.aviso}>
          <div>
            <span className={styles.obrigatorio}>*</span> Permitido apenas um
            agendamento por dia;
          </div>
          <div>
            <span className={styles.obrigatorio}>*</span> Um animal não pode
            agendar uma nova consulta se possuir agendamento em aberto.
          </div>
        </div>

        <div className={styles.button_container}>
          <CancelarWhiteButton />
          <button className={styles.agendar_button} onClick={handleAgendar}>
            Agendar
          </button>
        </div>
      </div>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.container1}>
                <div>
                  <div className={styles.title}>Realizar agendamento</div>
                  <div className={styles.description}>
                    Verifique as informações do agendamento antes de confirmar.
                  </div>
                </div>
              </div>

              <div className={styles.container2}>
                <h6>Verifique as informações</h6>
                <div className={styles.box}>
                  <div className={styles.item}>Paciente</div>
                  <div className={styles.subtitle}>
                    {selectedAnimal ? selectedAnimal.nome : ""}
                  </div>{" "}
                  {/* Alterado */}
                </div>

                <div className={styles.box}>
                  <div className={styles.item}>Horário</div>
                  <div className={styles.subtitle}>
                    {formatDate(
                      selecionarData,
                      selecionarHorario
                        ? selecionarHorario
                            .split("T")[1]
                            .split(":")
                            .slice(0, 2)
                            .join(":")
                        : ""
                    )}
                  </div>
                </div>

                <div className={styles.box}>
                  <div className={styles.item}>Consulta</div>
                  <div className={styles.subtitle}>
                    {selectedVaga && selectedVaga.tipoConsulta
                      ? selectedVaga.tipoConsulta.tipo
                      : ""}
                  </div>
                </div>
              </div>

              <div className={styles.div_button2}>
                <button
                  className={styles.button_cancelar_consulta}
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  className={styles.button_agendar_consulta}
                  type="button"
                  onClick={handleCreateAgendamento}
                >
                  Agendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        <Alert
          message="Agendamento realizado com sucesso!"
          show={showAlert}
          url="/meusAgendamentos"
        />
      }
      {showErrorAlert && (
        <ErrorAlert
          message="Erro ao realizar agendamento, tente novamente."
          show={showErrorAlert}
        />
      )}
    </div>
  );
};

export default HorariosSemana;
