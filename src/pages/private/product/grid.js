import React, {useState, useEffect} from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import useStyles from './styles/grid';
import AddDialog from './add';

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

import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {Link} from "react-router-dom";



function ProductGrid(){

  const classes = useStyles();
  const {firestore, user, storage} = useFirebase();

  const produkCol = firestore.collection(`toko/${user.uid}/product`);

  const [snapshot, loading] = useCollection(produkCol);

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [produkItems, setProdukItems] = useState([]);

  const handleDelete = produkDoc => async e=>{

    if(window.confirm('Yakin ?')){

      await produkDoc.ref.delete();
      const fotoURL = produkDoc.data().foto;

      if(fotoURL){
        storage.refFromURL(fotoURL).delete();
      }
    }
  }


  useEffect(() => {
    if(snapshot){
      setProdukItems(snapshot.docs);
    }
    
  }, [snapshot]);

  if(loading){
    return <AppPageLoading/>
  }
  
  return <>
    <Typography variant="h5" component="h1" paragraph> Daftar Produk </Typography>
    {
      produkItems.length <= 0 && <Typography> Belum ada data Produk</Typography>
    }
    <Grid container spacing={5}>
      {
        produkItems.map((produkDoc)=>{
          const produkData = produkDoc.data();
          return <Grid key={produkDoc.id} item={true} xs={12} md={6} lg={4}>
            <Card className={classes.card}>
              {
                produkData.foto && 
                <CardMedia 
                  className={classes.foto}
                  image={produkData.foto}
                  title={produkData.nama}
                />

              }

              {
                !produkData.foto && 
                <div className={classes.fotoPlaceholder}>
                  <ImageIcon
                  size="large"
                  color="disabled"
                  />
                </div>
              }
              <CardContent className={classes.produkDetails}>
                <Typography variant="h5">{produkData.nama}</Typography>
                <Typography variant="subtitle1">Harga: {currency(produkData.harga)}</Typography>
                <Typography variant="subtitle2">Stok: {produkData.stok}</Typography>
              </CardContent>
              <CardActions className={classes.produkActions}>
                <IconButton component={Link} to={`/product/edit/${produkDoc.id}`}>
                  <EditIcon/>
                </IconButton>
                <IconButton>
                  <DeleteIcon
                  onClick={handleDelete(produkDoc)}
                  />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        })
      }
    </Grid>
    <Fab color="primary" className={classes.fab} onClick={(e)=>{setOpenAddDialog(true)}}>
      <AddIcon/>
    </Fab>
    <AddDialog
      open={openAddDialog}
      handleClose={()=>{
        setOpenAddDialog(false);
      }}
    />
  </>
}

export default ProductGrid;