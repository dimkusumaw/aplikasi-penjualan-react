import React,{useState, useEffect} from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import { useFirebase } from '../../../components/FirebaseProvider';
import { useCollection } from 'react-firebase-hooks/firestore';
import AppPageLoading from '../../../components/AppPageLoading';
import ImageIcon from '@material-ui/icons/Image';
import {currency} from '../../../utils/formatter';
import format from 'date-fns/format';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ViewIcon from '@material-ui/icons/Visibility';
import {Link} from 'react-router-dom';
import DetailsDialog from './details';
import useStyles from './style';


function Transaction(){

  const{firestore,user} = useFirebase();
  const classes = useStyles();

  const transaksiCol = firestore.collection(`toko/${user.uid}/transaction`).orderBy("timestamp", "desc");
  const [snapshot, loading] = useCollection(transaksiCol);

  const [transaksiItems, setTransaksiItems] = useState([]);

  useEffect(() => {
    if(snapshot){
      setTransaksiItems(snapshot.docs);
    }
  }, [snapshot]);

  const handleDelete = transaksiDoc => async e => {

    if(window.confirm('Yakin ?')){

      await transaksiDoc.ref.delete();
    }
  }

  const [details, setDetails] = useState({
    open:false,
    transaksi:{}  
  });

  const handleCloseDetails = (e)=>{
    setDetails({
      open:false,
      transaksi:{}
    })
  }

  const handleOpenDetails = transaksiDoc => async (e)=>{
    setDetails({
      open:true,
      transaksi: transaksiDoc.data()
    })
  }

  if(loading){
    return <AppPageLoading/>
  }

  return <>
    <Typography component="h1" variant="h5" paragraph>
      Daftar Transaksi
    </Typography>
    {
      transaksiItems.length <= 0 &&
      <Typography>Belum ada transaksi</Typography>
    }

    <Grid container spacing={5}>
      {
        transaksiItems.map(transaksiDoc=>{
          const transaksiData = transaksiDoc.data();

          return <Grid key={transaksiDoc.id} item xs={12} sm={12} md={6} lg={4}>
            <Card className={classes.card}>
              <CardContent className={classes.transaksiSummary}>
                <Typography variant ="h5" noWrap>{transaksiData.no}</Typography>
                <Typography>Total : {currency(transaksiData.total)}</Typography>
                <Typography>Tanggal : {format(new Date(transaksiData.timestamp),'dd-MM-yyyy HH:mm')}</Typography>
              </CardContent>
              <CardActions className={classes.transaksiActions}>
                <IconButton onClick={handleOpenDetails(transaksiDoc)}><ViewIcon/></IconButton>
                <IconButton onClick={handleDelete(transaksiDoc)}><DeleteIcon/></IconButton>
              </CardActions>
            </Card>
          </Grid>
        })
      }
    </Grid>
    <DetailsDialog
      open={details.open}
      handleClose={handleCloseDetails}
      transaksi={details.transaksi}
    />
  </>
}

export default Transaction;