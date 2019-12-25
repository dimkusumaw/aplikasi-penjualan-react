import React, { useState, useEffect } from 'react';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { useFirebase } from '../../../components/FirebaseProvider';
import {useDocument} from 'react-firebase-hooks/firestore';
import UploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import AppPageLoading from '../../../components/AppPageLoading';
import {useSnackbar} from 'notistack';
import useStyles from './styles/edit';

function ProductEdit({match}){

    const classes = useStyles();
    const {firestore, storage, user} = useFirebase();
    const produkDoc = firestore.doc(`toko/${user.uid}/product/${match.params.productId}`);
    const produkStorageRef = storage.ref(`toko/${user.uid}/product`);

    const [snapshot, loading] = useDocument(produkDoc);
    const {enqueueSnackbar} = useSnackbar();
    const [isSubmitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
      nama: '',
      sku: '',
      harga: 0,
      stok: 0,
      deskripsi: '',
    })

    const [error, setError] = useState({
      nama: '',
      sku: '',
      harga: '',
      stok: '',
      deskripsi: '',
    });

    useEffect(() => {
      if(snapshot){
        setForm(currentForm =>({
          ...currentForm,
          ...snapshot.data()})); //untuk clone data yang telah di merge di firestore
      }

    }, [snapshot]);
    
    const handleChange = e =>{
      setForm({
        ...form,
        [e.target.name]:e.target.value
      })

      setError({
        ...error,
        [e.target.name]: ''
      })
    }

    const validate = ()=>{
      const newError = {...error};

      if(!form.nama){
        newError.nama = 'nama wajib diisi';
      }

      if(!form.harga){
        newError.harga = 'harga wajib diisi';
      }

      if(!form.stok){
        newError.stok = 'stok wajib diisi';
      }

      return newError;
    }
    
    const handleSubmit = async e =>{
      e.preventDefault();
      const findError = validate();

      if(Object.values(findError).some(err=>err !== '')){
        setError(findError);
      }else{
        setSubmitting(true);
        try {

          await produkDoc.set(form,{merge:true});
          enqueueSnackbar('Data toko berhasil disimpan', {variant:'success'});

        } catch (e) {
        enqueueSnackbar(e.message, {variant:'error'});
          
        }
        setSubmitting(false);
      }
    }


    const handleUploadFile = async (e)=>{
      console.log(e);
      const file = e.target.files[0];

      if(!['image/png','image/jpeg'].includes(file.type)){
       
        setError(error=>({
          ...error,
          foto:`Tipe file tidak didukung: ${file.type}`
        }))
      }else if(file.size >= 512000){
          setError(error=>({
            ...error,
            foto:`Ukuran foto melebihi 500 KB`
          }))
      }else{
        
        const reader = new FileReader();

        reader.onabort = ()=>{
          setError(error => ({
            ...error,
            foto: 'Proses pembacaan file dibatalkan'
          }))
        }

        reader.onerror = ()=>{
          setError(error => ({
            ...error,
            foto: 'File Tidak bisa dibaca'
          }))
        }

        reader.onload =async ()=>{
          setError(error => ({
            ...error,
            foto: ''
          }))

          setSubmitting(true);
          try {
            
            const fotoExt = file.name.substring(file.name.lastIndexOf('.'));

            const fotoRef = produkStorageRef.child(`${match.params.productId}${fotoExt}`);

            const fotoSnapshot = await fotoRef.putString(reader.result,'data_url');

            const fotoUrl = await fotoSnapshot.ref.getDownloadURL();

            setForm(currentForm=>({
                ...currentForm,
                foto:fotoUrl
            }))

          } catch(e){
            setError(error => ({
              ...error,
              foto: e.message
            }))

          }

          setSubmitting(false);
        }

        reader.readAsDataURL(file);
          
        }
    }
    

    if(loading){
        return <AppPageLoading/>
    }

    return <div>
      <Typography variant="h5" component="h1">Edit Produk: {form.nama}</Typography>
        <Grid container alignItems = "center" justify="center">
          <Grid item xs={12} sm={6}>
            <form id="produk-form" onSubmit={handleSubmit} noValidate>
              <TextField
                disabled={isSubmitting}
                required
                id="nama"
                label="Nama Produk"
                margin="normal"
                name="nama"
                fullWidth
                value={form.nama}
                onChange={handleChange}
                helperText={error.nama}
                error={error.nama?true:false}
              />
              <TextField
                disabled={isSubmitting}

                id="sku"
                label="SKU Produk"
                margin="normal"
                name="sku"
                fullWidth
                value={form.sku}
                onChange={handleChange}
                helperText={error.sku}
                error={error.sku?true:false}
              />
              <TextField
                required
                disabled={isSubmitting}
                id="harga"
                type="number"
                label="Harga"
                margin="normal"
                name="harga"
                fullWidth
                value={form.harga}
                onChange={handleChange}
                helperText={error.harga}
                error={error.harga?true:false}
              />
              <TextField
                required
                disabled={isSubmitting}
                id="stok"
                type="number"
                label="Stok"
                margin="normal"
                name="stok"
                fullWidth
                value={form.stok}
                onChange={handleChange}
                helperText={error.stok}
                error={error.stok?true:false}
              />
              <TextField
                id="deskripsi"
                disabled={isSubmitting}
                label="Deskripsi Produk"
                margin="normal"
                name="deskripsi"
                multiline
                rowsMax={3}
                fullWidth
                value={form.deskripsi}
                onChange={handleChange}
                helperText={error.deskripsi}
                error={error.deskripsi?true:false}
              />
            </form>
          </Grid>
          <Grid item xs={12} sm={6}>
            <div className={classes.uploadFoto}>
            {form.foto &&
              <img 
                src={form.foto}
                className={classes.previewFoto}
                alt={`Foto Produk ${form.nama}`}
              />
            }
              <input 
                className={classes.hideInputFile}
                type="file" 
                id="upload-foto-produk" 
                accept="image/jpeg,image/png" 
                onChange={handleUploadFile}
              />

              <label 
              htmlFor="upload-foto-produk">
                <Button variant="outlined" 
                component="span"
                disabled={isSubmitting} 
                >Upload Foto<UploadIcon className={classes.iconRight}/></Button></label>
                {error.foto && <Typography color="error"> {error.foto}</Typography>}
            </div>
          </Grid>
          <Grid item xs={12}>
              <Button color="primary" variant="contained" form="produk-form" type="submit" 
                disabled={isSubmitting}
              >
                Simpan<SaveIcon className={classes.iconRight}/>
              </Button>
          </Grid>
        </Grid>
    </div>
}

export default ProductEdit;