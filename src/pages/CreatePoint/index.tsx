import React,{useEffect, useState, ChangeEvent, FormEvent} from 'react'
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map,TileLayer,Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'
import "./styles.css"

import logo from "../../assets/logo.svg"
import api from '../../services/api'
import axios from 'axios'

interface Item{
  id:number;
  title: string;
  image_url:string
}

interface IBGEUFResponse{
  sigla: string;
}
interface IBGECityResponse{
  nome: string;
}


const CreatePoint = () =>{
  const [items,setItems] = useState<Item[]>([]);
  const [ufs,setUfs] = useState<string[]>([]);
  const [citys,setCitys] = useState<string[]>([]);

  const[initialPosition,setinitialPosition] =useState<[number,number]>([0,0]); 
  const[selectItems,setSelectedItems] =useState<number[]>([]);
  const[selectUf,setSelectedUf] =useState('0');
  const[selectCity,setSelectedCity] =useState('0');
  const[selectPosition,setSelectedPosition] =useState<[number,number]>([0,0]);
  const [formData,setFormData] = useState({
    name:"",
    email:"",
    whatsapp:""
  });

  const history = useHistory();
  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position=>{
      const {latitude , longitude} = position.coords;

      setinitialPosition([latitude,longitude]);
      setSelectedPosition([latitude,longitude]);
    });
  },[])

  useEffect(()=>{
    api.get('items').then(response=>{
      setItems(response.data)
    })
  },[])

  useEffect(()=>{
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/').then(response=>{
      const ufInitials = response.data.map(uf => uf.sigla);
      setUfs(ufInitials)
    });
  },[]);

  useEffect(()=>{
    if(selectUf ==="0"){
      return
    }

    axios
    .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUf}/municipios`)
    .then(response=>{
      const cityNames = response.data.map(city => city.nome);
      setCitys(cityNames)
    });
  },[selectUf])

  function hadlerSelectUf(event:ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value;
    setSelectedUf(uf)
  }

  function hadlerSelectCity(event:ChangeEvent<HTMLSelectElement>){
    const city = event.target.value;
    setSelectedCity(city)
  }

  function hadlerMapClick(event:LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function hadlerInputChange(event:ChangeEvent<HTMLInputElement>){
    const {name,value} = event.target;

    setFormData({...formData,[name]:value})
  }

  function hadlerSelectItem(id:number){
    const alreadySelected = selectItems.findIndex(item=> item ==id);
    if(alreadySelected>=0){
      const filteredItems = selectItems.filter(item=> item !==id);
      setSelectedItems(filteredItems);
    }else{
      setSelectedItems([...selectItems,id]);

    }
  }

  async function hadlerSubmit(event:FormEvent){
    event.preventDefault()
    const {name, email,whatsapp}= formData;
    const uf = selectUf;
    const city = selectCity;
    const [latitude,longitude] = selectPosition;
    const items = selectItems;

    const data ={
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    }
    await api.post('points',data);

    alert("Ponto de Coleta Criado");
    history.push("/")
  }

return(
  <div id="page-create-point">
    <header>
      <img src={logo} alt="ecoleta"/>
      <Link to="/"> 
        <FiArrowLeft />
        Voltar Para Home
      </Link>
    </header>
    <form onSubmit={hadlerSubmit}>
      <h1>
      Cadastro do <br/>
      Ponto de coleta
      </h1>

      <fieldset>
        <legend>
          <h2>Dados</h2>
        </legend>

        <div className="field">
          <label htmlFor="name">Nome da entidade</label>
          <input 
          type="text"
          name="name"
          id="name"
          onChange={hadlerInputChange}
          />
        </div>
        <div className="field-group">
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input 
          type="email"
          name="email"
          id="email"
          onChange={hadlerInputChange}
          />
        </div>
        <div className="field">
          <label htmlFor="whatsapp">Whatsapp</label>
          <input 
          type="text"
          name="whatsapp"
          id="whatsapp"
          onChange={hadlerInputChange}
          />
        </div>
        </div>
  
      </fieldset>

      <fieldset>
        <legend>
          <h2>Endereço</h2>
          <span>Selecione o Endereço no mapa</span>
        </legend>

          <Map center={initialPosition} zoom={15} Onclick={hadlerMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectPosition}/>
          </Map>

        <div className="field-group">
          <div className="field">
            <label htmlFor="uf">Estado (UF)</label>
            <select
              name="uf" 
              id="uf" 
              value={selectUf} 
              onChange={hadlerSelectUf}
             >
              <option value="0">Selecione uma UF</option>
              {
                ufs.map(uf=>(
                <option key={uf} value={uf}>{uf}</option>
                ))
              }
            </select>
          </div>

          <div className="field">
            <label htmlFor="city">Cidade</label>
            <select 
              name="city"
              id="city"
              value={selectCity}
              onChange={hadlerSelectCity}
             > 
              <option value="0">Selecione uma Cidade</option>
              {
                citys.map(city=>(
                <option key={city} value={city}>{city}</option>
                ))
              }
            </select>
          </div>
        </div>


      </fieldset>
      
      <fieldset>
        <legend>
          <h2>Ítens de coleta</h2>
          <span>Selecione um ou mais items a baixo</span>
        </legend>
        <ul className="items-grid">
          {items.map(item=>(
            <li 
              key={item.id}
              onClick={()=>hadlerSelectItem(item.id)}
              className={selectItems.includes(item.id) ? "selected":''}
             >
            <img src={item.image_url} alt={item.title}/>
          <span>{item.title}</span>
          </li>
          ))}
        </ul>
      </fieldset>
      <button type="submit">
        Cadastrar Ponto de Coleta
      </button>
    </form>
  </div>
);
}

export default CreatePoint;