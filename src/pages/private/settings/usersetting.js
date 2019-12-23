import React, { useRef, useState } from 'react';
import TextField from '@material-ui/core/TextField';
import { useFirebase } from '../../../components/FirebaseProvider';
import { useSnackbar } from 'notistack';
import isEmail from 'validator/lib/isEmail';
import useStyles from './styles/usersetting';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';



function UserSetting(){

  const classes = useStyles();
  const {user} = useFirebase();
  const [error, setError] = useState({
    displayName: '',
    email : '',
    password: ''
  });
  const {enqueueSnackbar} = useSnackbar();
  const [isSubmitting, setSubmitting] = useState(false);

  const displayNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();

  const saveDisplayName = async(e)=>{
    const displayName = displayNameRef.current.value;

    console.log (displayName);
    if(!displayName){
      setError({ displayName: 'Nama Wajib diisi'})
    }else if(displayName !== user.displayName){
      setError({displayName: ''})
      setSubmitting(true);
      await user.updateProfile ({
        displayName
      })
      setSubmitting(false);
      enqueueSnackbar('Data Pengguna Berhasil diperbaharui',{variant:'success'})
    }

  }

  const updateEmail = async (e)=>{
    const email = emailRef.current.value;

    if(!email){
      setError({
        email: 'Email wajib diisi'
      })
    }else if(!isEmail){
      setError({
        email: 'Email tidak valid'
      })
    }else if(email !== user.email){
      setError({
        email:''
      })
      setSubmitting(true)
      try{
        await user.updateEmail(email);
        enqueueSnackbar('email Berhasil di perbaharui',{variant:'success'})
      }
      catch(e){
        let emailError ='';
        switch(e.code){
          case 'auth/email-already-in-use':
            emailError = 'Email sudah ada';
          break;
          case 'auth/invalid-email':
            emailError = 'Email tidak valid';
          break;
          case 'auth/requires-recent-login':
            emailError = 'Email sudah ada';
          break;
          default:
            emailError = 'Terjadi kesalahan silahkan coba lagi';
          break;
        }
        setError(
          {
            email:emailError
          }
        )

      }
      setSubmitting(false);
    }

  }

  const sendEmailVerification = async (e)=>{
    const actionCodeSettings = {
      url: `${window.location.origin}/login`
    }
    setSubmitting(true);
    await user.sendEmailVerification(actionCodeSettings);
    enqueueSnackbar(`Email verifikasi telah dikirim ke ${emailRef.current.value}`, {variant:'success'});
    setSubmitting(false);

  }

  const updatePassword = async (e)=>{
    const password = passwordRef.current.value

    if(!password){
      setError({
        password: 'Password wajib diisi'
      })
    }else{
      setSubmitting(true)
      try{
        await user.updatePassword(password);
        enqueueSnackbar('Password Berhasil di perbaharui',{variant:'success'})
      }catch(e){
        let errorPassword='';
        switch (e.code) {
          case 'auth/weak-password':
            errorPassword = 'Password terlalu lemah';
            break;
          case 'auth/requires-recent-login':
              errorPassword = 'Silahkan logout dan login kembali untuk memperbaharui password';
            break;
          default:
            errorPassword = 'Terjadi Kesalahan silahkan coba lagi';
            break;
        }
        setError({
          password:errorPassword
        })
      }
      setSubmitting(false)
    }

  }
  return <div className={classes.userSetting}>
    <TextField
      id="displayName"
      name="displayName"
      margin="normal"
      label="Nama"
      defaultValue={user.displayName}
      inputProps={{
        ref: displayNameRef,
        onBlur: saveDisplayName
      }}
      disabled={isSubmitting}
      helperText={error.displayName}
      error = {error.displayName?true:false}
    />

    <TextField
    id="email"
    name="email"
    margin="normal"
    type="email"
    label="Email"
    defaultValue={user.email}
    inputProps={{
      ref:emailRef,
      onBlur:updateEmail
    }}
    disabled={isSubmitting}
    helperText={error.email}
    error={error.email?true:false}
    />
      {
        user.emailVerified?
        <Typography variant="subtitle1" color="primary"> Email sudah terverifikasi</Typography>
        :
        <Button variant="outlined"
        onClick={sendEmailVerification}
        disabled={isSubmitting}
        >
            Kirim konfirmasi Email
        </Button>
      }

    <TextField
    id="password"
    name="password"
    margin="normal"
    label="Password Baru"
    type="password"
    inputProps = {{
      ref:passwordRef,
      onBlur: updatePassword
    }}
    autoComplete = "new-password"
    helperText = {error.password}
    error = {error.password?true:false}
    disabled={isSubmitting}
    />
</div>
}

export default UserSetting;