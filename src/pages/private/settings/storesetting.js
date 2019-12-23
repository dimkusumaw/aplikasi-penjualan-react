import React, {useState, useEffect}from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { useSnackbar } from 'notistack';
import useStyles from './styles/storesetting';
import isURL from 'validator/lib/isURL';
import { useFirebase } from '../../../components/FirebaseProvider';
import { useDocument } from 'react-firebase-hooks/firestore';
import AppPageLoading from '../../../components/AppPageLoading';
import { Prompt } from 'react-router-dom';
// import Snackbar from '@material-ui/core/Snackbar';
function StoreSetting(){
  const classes = useStyles();
  const {firestore, user} = useFirebase();
  const tokoDoc = firestore.doc(`toko/${user.uid}`);
  const[snapshot, loading] = useDocument(tokoDoc);
  const{enqueueSnackbar} = useSnackbar();
  const [form, setForm] = useState({
    nama:'',
    alamat:'',
    telepon:'',
    website:''

  })

  const [error, setError] = useState({
    nama:'',
    alamat:'',
    telepon:'',
    website:''
  })

  const [isSubmitting, setSubmitting] = useState(false);

  const[isSomethingChange, setSomethingCHange] = useState(false);

  const handleChange = e=>{
    
    setForm({
      ...form,
      [e.target.name]:e.target.value
    })

    setError({
      [e.target.name]: ''
    })

    setSomethingCHange(true);
  }

  const validate = ()=>{
    const newError = {...error};

    if(!form.nama){
      newError.nama = 'Nama wajib diisi';
    }

    if(!form.alamat){
      newError.alamat = 'Alamat wajib diisi';
    }

    if(!form.telepon){
      newError.telepon = 'Telepon wajib diisi';
    }

    if(!form.website){
      newError.website = 'Website wajib diisi';
    }else if (!isURL(form.website)){
      newError.website = 'Website tidak valid';
    }

    return newError;
  }

  const handleSubmit = async e=>{
    e.preventDefault();
    const findErrors = validate();

    if(Object.values(findErrors).some(err=>err!=='')){
      setError(findErrors);
    } else{
      setSubmitting(true);
      try{
       await tokoDoc.set(form,{merge:true});
       setSomethingCHange(false);
       enqueueSnackbar('Data toko berhasil disimpan', {variant:'success'});
      }catch(e){
        enqueueSnackbar(e.message, {variant:'error'});
      }
      setSubmitting(false);
    }
  }
  
  useEffect(()=>{

    if(snapshot){
      setForm(snapshot.data());
    }

  },[snapshot])

  if(loading){
    return <AppPageLoading/>
  }

  return <div className={classes.storeSetting}>
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        id="nama"
        name="nama"
        label="Nama Toko"
        margin="normal"
        required
        fullWidth
        value={form.nama}
        onChange={handleChange}
        error = {error.nama?true:false}
        helperText = {error.nama}
        disabled={isSubmitting}
      />
      <TextField
        required
        id="alamat"
        name="alamat"
        label="Alamat Toko"        
        fullWidth
        multiline
        rowsMax={3}
        margin="normal"
        value={form.alamat}
        onChange={handleChange}
        error = {error.alamat?true:false}
        helperText = {error.alamat}
        disabled={isSubmitting}
      />
      <TextField
        required
        id="telepon"
        name="telepon"
        fullWidth
        label="No Telepon Toko"
        margin="normal"
        value={form.telepon}
        onChange={handleChange}
        error = {error.telepon?true:false}
        helperText = {error.telepon}
        disabled={isSubmitting}
      />
      <TextField
        required
        id="website"
        name="website"
        label="Website"
        margin="normal"
        fullWidth
        value={form.website}
        onChange={handleChange}
        error = {error.website?true:false}
        helperText = {error.website}
        disabled={isSubmitting}
      />
      <Button 
      variant="contained"
      color="primary"
      type="submit"
      className={classes.actionButton}
      margin="normal"
      disabled={isSubmitting || !isSomethingChange}
      >
        Simpan
      </Button>
    </form>
    <Prompt
      when={isSomethingChange}
      message = "Yakin ?"
    />
  </div>
}

export default StoreSetting;