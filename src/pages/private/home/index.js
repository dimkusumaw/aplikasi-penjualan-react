import React,{useState,useEffect} from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import {currency} from '../../../utils/formatter';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import { useFirebase } from '../../../components/FirebaseProvider';
import{ useCollection} from 'react-firebase-hooks/firestore';
import AppPageLoading from '../../../components/AppPageLoading';
import useStyles from './styles';
import { useSnackbar } from 'notistack';
import format from 'date-fns/format';


function Home(){
  const { auth, firestore, user } = useFirebase();
  const {enqueueSnackbar} = useSnackbar();
  const todayDateString = format(new Date(), 'yyyy-MM-dd');
  const transaksiCol = firestore.collection(`toko/${user.uid}/transaction`);
  const produkCol = firestore.collection(`toko/${user.uid}/product`);
  const [snapshotTransaksi, loadingTransaksi] = useCollection(transaksiCol.where('tanggal','==',todayDateString));
  const [snapshotProduk, loadingProduk] = useCollection(produkCol);
  const [produkItems,setProdukItems] = useState([]);
  const classes = useStyles();
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [filterProduk, setFilterProduk] = useState('');
  const initialTransaksi = {
    no:'',
    items:{

    },
    total:0,
    tanggal:todayDateString
  };
  const [transaksi, setTransaksi] = useState(initialTransaksi);

  useEffect(() => {
    if(snapshotProduk){
      setProdukItems(snapshotProduk.docs.filter(
        produkDoc=>{
          if(filterProduk){
            return produkDoc.data().nama.toLowerCase().includes(filterProduk.toLowerCase());
          }

          return true;
        }
      ))
    }
  }, [snapshotProduk, filterProduk]);

  useEffect(() => {
    if(snapshotTransaksi){
      setTransaksi(transaksi=>({
        ...transaksi,
        no: `${transaksi.tanggal}/${snapshotTransaksi.docs.length +1}`
      }))
    }else{
      setTransaksi(transaksi=>({
        ...transaksi,
        no: `${transaksi.tanggal}/1`
      }))
    }
  }, [snapshotTransaksi]);

  const addItem = produkDoc=>e=>{
    let newItem = {...transaksi.items[produkDoc.id]};
    
    const produkData = produkDoc.data();
    if(newItem.jumlah){
      newItem.jumlah = newItem.jumlah+1;
      newItem.subtotal = produkData.harga * newItem.jumlah;

    }else{
      newItem.jumlah = 1;
      newItem.harga = produkData.harga;
      newItem.subtotal = produkData.harga;
      newItem.nama = produkData.nama;
    }
    
    const newItems = {
      
        ...transaksi.items,
        [produkDoc.id]: newItem
      
    }

    if(newItem.jumlah > produkData.stok){
      enqueueSnackbar('Jumlah melebihi stok produk', {variant:'error'})
    }else{
      setTransaksi({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce(
          (total,k) => {
            const item = newItems[k];
            return total+parseInt(item.subtotal);
          },0
        )
      })
    }
  }

  const handleChangeJumlah = k => e =>{
    let newItem = {...transaksi.items[k]};

    newItem.jumlah = parseInt(e.target.value);
    newItem.subtotal = newItem.harga * newItem.jumlah;

    const newItems = {
      
      ...transaksi.items,
      [k]: newItem
    
  }

  const produkDoc = produkItems.find(item => item.id === k);
  const produkData = produkDoc.data()

    if(newItem.jumlah > produkData.stok){
      enqueueSnackbar('Jumlah melebihi stok produk', {variant:'error'})
    }else{
      setTransaksi({
        ...transaksi,
        items: newItems,
        total: Object.keys(newItems).reduce(
          (total,k) => {
            const item = newItems[k];
            return total+parseInt(item.subtotal);
          },0
        )
      })
    }
  }

  const simpanTransaksi = async (e)=>{

    if(Object.keys(transaksi.items).length <= 0){
      enqueueSnackbar('Tidak ada transaksi untuk disimpan', {variant:'error'})
      return false;
    }else{
      setSubmitting(true);
      try {
        await transaksiCol.add({
          ...transaksi,
          timestamp: Date.now()
        })
        //update stok

        await firestore.runTransaction(transaction => {
          
          const produkIDs = Object.keys(transaksi.items);

          return Promise.all(produkIDs.map(productId=>{
            
            const produkRef = firestore.doc(`toko/${user.uid}/product/${productId}`);

            return transaction.get(produkRef).then(
              (produkDoc)=>{

                if(!produkDoc.exists){
                  throw Error('Produk tidak ada');
                }

                let newStok = parseInt(produkDoc.data().stok) - parseInt(transaksi.items[productId].jumlah);

                if(newStok<0){
                  newStok = 0;
                }

                transaction.update(produkRef, {stok: newStok});

              }
            )

          }))
        })
        
        enqueueSnackbar('Transaksi berhasil disimpan', {variant:'success'});
        setTransaksi(transaksi => ({
          ...initialTransaksi,
          no : transaksi.no
        }));
      } catch(e) {

        enqueueSnackbar(e.message, {variant:'error'});
      }

    }
    setSubmitting(false);
  }

  if(loadingProduk || loadingTransaksi){
    return <AppPageLoading/>
  }

  return <>
    <Typography variant="h5" component="h1" paragraph>
      Buat Transaksi Baru
    </Typography>
    <Grid container spacing={5}>
      <Grid item xs>
        <TextField 
        label="No Transaksi"
        value={transaksi.no}
        inputProps={{ readOnly:true }}
        />
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          onClick = {simpanTransaksi}
          disabled= {isSubmitting}
        >
          Simpan Transaksi
        </Button>
      </Grid>
    </Grid>
    <Grid container spacing={5}>
      <Grid item xs={12} md={8}>
        <Table>
          <TableHead>
            <TableCell>Item</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Harga</TableCell>
            <TableCell>Subtotal</TableCell>
          </TableHead>
          <TableBody>
          {
            Object.keys(transaksi.items).map(k=>{
              const item = transaksi.items[k];
              return (
                <TableRow key={k}>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell><TextField value={item.jumlah} type="number" className={classes.inputJumlah} onChange={handleChangeJumlah(k)}/></TableCell>
                  <TableCell>{currency(item.harga)}</TableCell>
                  <TableCell>{currency(item.subtotal)}</TableCell>
                </TableRow>
              )
            })
          }
          <TableRow>
            <TableCell colSpan={3}>
              <Typography variant="subtitle2">Total</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="h6">{currency(transaksi.total)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
        </Table>
      </Grid>
      <Grid item xs={12} md={4}>
        <List
          className ={classes.produkList}
          component = "nav"
          subheader = {
            <ListSubheader component="div">
              <TextField
              autoFocus
              label='Cari Produk'
              fullWidth
              margin="normal"
              onChange={e=>{
                setFilterProduk(e.target.value);
              }}
              />
            </ListSubheader>
          }
        >
            {
              produkItems.map((produkDoc)=>{

                const produkData = produkDoc.data();
                return <ListItem 
                key={produkDoc.id} 
                button
                disabled={!produkData.stok || isSubmitting}
                onClick={addItem(produkDoc)}>
                  {
                    produkData.foto?
                    <ListItemAvatar>
                      <Avatar
                        src={produkData.foto}
                        alt={produkData.nama}
                      />

                    </ListItemAvatar>
                    :
                    <ListItemIcon>
                      <ImageIcon/>
                    </ListItemIcon>
                  } 
                  <ListItemText
                    primary={produkData.nama}
                    secondary={`Stok: ${produkData.stok || 0}`}
                  />
                </ListItem>
              })
            }
        </List>
      </Grid>
    </Grid>
  </>
}

export default Home;