import React, { Fragment, MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import {
  Divider,
  Stack,
  Badge,
  Chip,
  IconButton,
  // ListItemIcon,
  Fab,
  ListItemText,
  Menu,
  MenuItem,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  DialogContent,
  DialogActions,
  Dialog,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
// import RefreshIcon from '@material-ui/icons/Refresh';
// import { BuyIcon, SellIcon } from './icon';
import SyncIcon from '@material-ui/icons/Sync';
import AddIcon from '@material-ui/icons/Add';
import { Stock, IStockExit, IStockEntry } from './api/index';

const BUY = 'BUY';
const SELL = 'SELL';

type IStockActionType = 'BUY' | 'SELL';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [actionType, setActionType] = useState<IStockActionType | null>(null);
  const [anchor, setAnchor] = useState<null | HTMLButtonElement>(null);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [showCleared, setShowCleared] = useState(false);

  const nameRef: RefObject<any> = useRef(null);
  const codeRef: RefObject<any> = useRef(null);
  const stockRef: MutableRefObject<null | Stock> = useRef(null);

  useEffect(() => {
    // net.r(Stock).then(stocks => {
    //   for (let stock of stocks) {
    //     stock.setRealtimePrice().then(() => {
    //       setAllStocks(stocks => stocks.concat(stock));
    //     });
    //   }
    // });
    // sto
    Stock.empty()
      .r({ id: '' })
      .then(stocks => {
        return stocks.map(_ => Stock.empty().decode(_));
      })
      .then(stocks => {
        for (let stock of stocks) {
          stock.setRealtimePrice().then(() => {
            setAllStocks(stocks => stocks.concat(stock));
          });
        }
      });
  }, []);

  useEffect(() => {
    if (showCleared) {
      setStocks(allStocks);
    } else {
      setStocks(allStocks.filter(s => s.glance.share > 0));
    }
  }, [allStocks, showCleared]);

  function confirm() {
    const code = codeRef.current.value;
    const stock = new Stock(code);
    stock
      .c()
      .then(() => stock.setRealtimePrice())
      .then(() => {
        setStocks(stocks => stocks.concat(stock));
      });
    setOpen(false);
  }

  function handleAdd(price: number, share: number, entry?: IStockEntry) {
    if (actionType !== null && stockRef.current !== null) {
      if (actionType === BUY) {
        stockRef.current.enter(price, share);
      } else {
        stockRef.current.exit(price, share, entry);
      }
      stockRef.current.u();
      setActionType(null);
    }
  }

  function updateStock(stock: Stock) {
    stock.setRealtimePrice().then(() => {
      setStocks(stocks => stocks.concat());
    });
  }

  function clear() {
    if (stockRef.current) {
      stockRef.current.clear();
      stockRef.current.u();
      setAnchor(null);
      setOpenAlertDialog(false);
    }
  }

  return (
    <Box m={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Fab
          color="primary"
          variant="extended"
          onClick={() => {
            setOpen(true);
          }}
          size="small"
        >
          <AddIcon />
          ??????????????????
        </Fab>
        <Button
          variant="outlined"
          onClick={() => {
            setShowCleared(!showCleared);
          }}
        >
          {`${showCleared ? '??????' : '??????'}???????????????`}
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            stocks.forEach(updateStock);
          }}
        >
          ??????????????????
        </Button>
      </Stack>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => {
          setAnchor(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setActionType(BUY);
            setAnchor(null);
          }}
        >
          <ListItemText>????????????</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setActionType(SELL);
            setAnchor(null);
          }}
        >
          <ListItemText>????????????</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setOpenAlertDialog(true)}>
          <ListItemText>??????</ListItemText>
        </MenuItem>
        {/* <MenuItem onClick={updateStock}>
          <ListItemText>??????????????????</ListItemText>
        </MenuItem> */}
      </Menu>
      <Box mt={1}>
        {stocks
          .sort((a, b) => {
            return b.glance.money - a.glance.money;
          })
          .map(stock => (
            <Accordion key={stock.code}>
              <AccordionSummary>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                    <IconButton
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        updateStock(stock);
                      }}
                      color="primary"
                    >
                      <SyncIcon></SyncIcon>
                    </IconButton>
                    <span>{stock.name}</span>
                    <Chip
                      size="small"
                      label={`???????????????${stock.realtimePrice}`}
                      color={
                        (stock.lastPrice as number) > (stock.realtimePrice as number)
                          ? 'success'
                          : 'error'
                      }
                    />
                    <Chip
                      size="small"
                      label={`????????????${stock.rise}`}
                      color={
                        (stock.lastPrice as number) > (stock.realtimePrice as number)
                          ? 'success'
                          : 'error'
                      }
                    />
                    <Chip size="small" label={`???????????????${stock.glance.money}`} />
                    <Chip size="small" label={`???????????????${stock.glance.costPrice}`} />
                    <Chip
                      size="small"
                      label={`???????????????${stock.glance.floatingProfit}`}
                      color={stock.glance.floatingProfit > 0 ? 'error' : 'success'}
                    />
                    <Chip
                      size="small"
                      label={`???????????????${stock.glance.ratio}%`}
                      color={stock.glance.floatingProfit > 0 ? 'error' : 'success'}
                    />
                  </Stack>
                  <IconButton
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      stockRef.current = stock;
                      setAnchor(e.currentTarget);
                    }}
                  >
                    <MoreVertIcon></MoreVertIcon>
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Points stock={stock}></Points>
              </AccordionDetails>
            </Accordion>
          ))}
      </Box>
      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>??????????????????</DialogTitle>
        <DialogContent>
          <TextField label="????????????" fullWidth size="small" margin="normal" inputRef={codeRef} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            ??????
          </Button>
          <Button onClick={confirm}>??????</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAlertDialog} maxWidth="xs" fullWidth>
        <DialogContent>?????????????????????????????????</DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAlertDialog(false);
            }}
          >
            ??????
          </Button>
          <Button color="error" onClick={clear}>
            ??????
          </Button>
        </DialogActions>
      </Dialog>
      <AddPoint
        stock={stockRef.current}
        type={actionType}
        onClose={() => setActionType(null)}
        onAdd={handleAdd}
      />
    </Box>
  );
}

function AddPoint(props: {
  stock: Stock | null;
  type: IStockActionType | null;
  onClose: () => void;
  onAdd: (price: number, share: number, entry?: IStockEntry) => void;
}) {
  const priceRef = useRef<any>();
  const entry = useRef<IStockEntry>();
  const [share, setShare] = useState(100);

  function confirm() {
    props.onAdd(priceRef.current.value * 1, share, entry.current);
  }

  return (
    <Dialog open={props.type !== null} maxWidth="xs" fullWidth>
      <DialogTitle>{`??????${props.type === BUY ? '???' : '???'}???`}</DialogTitle>
      <DialogContent>
        {props.type === SELL
          ? props.stock?.getAvailableEntries(true).map(_ => {
              return (
                <Chip
                  onClick={() => {
                    entry.current = _;
                    setShare(_.share);
                  }}
                  size="small"
                  label={`${_.price} * ${_.share}`}
                  sx={{
                    marginRight: '8px',
                    marginBottom: '8px',
                  }}
                />
              );
            })
          : null}
        <TextField
          size="small"
          margin="normal"
          fullWidth
          label="??????"
          defaultValue={props.stock?.realtimePrice}
          inputRef={priceRef}
        />
        <TextField
          onChange={e => {
            setShare(Number(e.target.value));
          }}
          size="small"
          margin="normal"
          fullWidth
          label="??????"
          value={share}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>??????</Button>
        <Button onClick={confirm}>??????</Button>
      </DialogActions>
    </Dialog>
  );
}

function Points(props: { stock: Stock }) {
  const date = new Date().toLocaleDateString();
  return (
    <Box sx={{ flexWrap: 'wrap' }}>
      <Divider sx={{ marginBottom: '16px' }}>??????</Divider>
      {props.stock.entries
        .filter(_ => _.share > 0)
        .map((_, i) => {
          return (
            <Badge
              badgeContent={_.date === date ? '??????' : 0}
              overlap="rectangular"
              color="primary"
              key={i}
              sx={{ marginRight: '12px', marginTop: '8px' }}
            >
              <Chip
                variant="outlined"
                color={(_.floatingProfit || 0) > 0 ? 'error' : 'success'}
                label={`???????????????${_.price}???${
                  _.share === 0 ? '' : '?????????' + _.share + '???'
                }???????????????${_.floatingProfit}`}
              />
            </Badge>
          );
        })}
      <Divider sx={{ marginTop: '16px', marginBottom: '16px' }}>??????</Divider>
      {props.stock.entries.map((entry, i) => {
        return (
          <Fragment key={i}>
            {entry.exits?.map((_, j) => {
              return (
                <Badge
                  badgeContent={_.T ? 'T' : 0}
                  color="primary"
                  key={j}
                  sx={{ marginRight: '12px', marginTop: '8px' }}
                >
                  <Chip
                    variant="outlined"
                    color={(_.profit || 0) > 0 ? 'error' : 'success'}
                    label={`?????????${(_.price - entry.price).toFixed(3)}???${
                      _.share === 0 ? '' : '?????????' + _.share + '???'
                    }?????????${_.profit}`}
                  />
                </Badge>
              );
            })}
          </Fragment>
        );
      })}
    </Box>
  );
}
