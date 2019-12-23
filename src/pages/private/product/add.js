import React, { useState } from 'react';
import propTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {useFirebase} from '../../../components/FirebaseProvider';
import {withRouter} from 'react-router-dom';


function AddDialog({history,open, handleClose}){
  const {firestore, user} = useFirebase();

  const produkCol= firestore.collection(`toko/${user.uid}/product`);
  const [error,setError] = useState('');
  const [nama, setNama] = useState('');
  const [isSubmitting,setSubmitting] = useState(false);
  // const [isSomethingChange,setSomethingChange] = useState(false);

  const handleSimpan = async e =>{

    setSubmitting(true);
    try {
      if(!nama){

        throw new Error('Nama Produk wajib diisi');
      }

      const produkBaru = await produkCol.add({nama});

      history.push(`product/edit/${produkBaru.id}`);
    } catch (e) {
      setError(e.message)
      
    }
    setSubmitting(false);
  }

  return <Dialog
    disableBackdropClick={isSubmitting}
    disableEscapeKeyDown={isSubmitting}
    open={open}
    onClose={handleClose}
  >
      <DialogTitle>Buat Produk Baru</DialogTitle>
      <DialogContent dividers>
        <TextField 
          id="nama"
          label="Nama Produk"
          value={nama}
          onChange={(e)=>{
            setError('');
            setNama(e.target.value);
          }
          }
          helperText={error}
          error = {error?true:false}
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions>
          <Button disabled={isSubmitting} onClick={handleClose}>Batal</Button>
          <Button onClick={handleSimpan} color="primary" disabled={isSubmitting}>Simpan</Button>
      </DialogActions>
  </Dialog>
}

AddDialog.propTypes = {
  open : propTypes.bool.isRequired,
  handleClose: propTypes.func.isRequired
}
export default withRouter(AddDialog);