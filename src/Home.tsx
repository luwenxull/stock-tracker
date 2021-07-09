import React, { Fragment, MutableRefObject, RefObject, useEffect, useRef, useState } from 'react';
import {
  Divider,
  Stack,
  Badge,
  Chip,
  IconButton,
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
import { Stock, net } from './api/index';

const BUY = 'BUY';
const SELL = 'SELL';

type IStockActionType = 'BUY' | 'SELL';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [actionType, setActionType] = useState<IStockActionType | null>(null);
  const [anchor, setAnchor] = useState<null | HTMLButtonElement>(null);
  // const [updateID, setUpdateID] = useState(Math.random());

  const nameRef: RefObject<any> = useRef(null);
  const codeRef: RefObject<any> = useRef(null);
  const stockRef: MutableRefObject<null | Stock> = useRef(null);

  useEffect(() => {
    net.r(Stock).then(stocks => {
      for (let stock of stocks) {
        stock.setRealtimePrice().then(() => {
          if (stock.glance.share > 0) {
            setStocks(stocks => stocks.concat(stock));
          }
        });
      }
    });
  }, []);

  function confirm() {
    const name = nameRef.current.value;
    const code = codeRef.current.value;
    const stock = new Stock(name, code);
    net
      .c(Stock, stock)
      .then(() => stock.setRealtimePrice())
      .then(() => {
        setStocks(stocks => stocks.concat(stock));
      });
    setOpen(false);
  }

  function handleAdd(price: number, share: number) {
    if (actionType !== null && stockRef.current !== null) {
      if (actionType === BUY) {
        stockRef.current.enter(price, share);
      } else {
        stockRef.current.exit(price, share);
      }
      net.u(Stock, stockRef.current);
      setActionType(null);
    }
  }

  function updateStock() {
    stockRef.current?.setRealtimePrice().then(() => {
      setAnchor(null)
    });
  }

  return (
    <Box m={3}>
      <Button
        variant="contained"
        onClick={() => {
          setOpen(true);
        }}
      >
        添加追踪股票
      </Button>
      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => {
          setAnchor(null);
        }}
      >
        <MenuItem onClick={() => setActionType(BUY)}>添加买点</MenuItem>
        <MenuItem onClick={() => setActionType(SELL)}>添加卖点</MenuItem>
        <MenuItem onClick={updateStock}>获取最新价格</MenuItem>
      </Menu>
      <Box mt={1}>
        {stocks.map(stock => (
          <Accordion key={stock.code}>
            <AccordionSummary>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <span>{stock.name}</span>
                  <Chip size="small" label={`当前股价：${stock.realtimePrice}`} />
                  <Chip size="small" label={`持仓金额：${stock.glance.money}`} />
                  <Chip size="small" label={`持仓成本：${stock.glance.costPrice}`} />
                  <Chip
                    size="small"
                    label={`浮动盈亏：${stock.glance.floatingProfit}`}
                    color={stock.glance.floatingProfit > 0 ? 'error' : 'success'}
                  />
                  <Chip
                    size="small"
                    label={`盈亏比例：${stock.glance.ratio}%`}
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
              <Divider sx={{ marginBottom: '16px' }}>持仓分析</Divider>
              <Points stock={stock}></Points>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Dialog open={open} maxWidth="xs" fullWidth>
        <DialogTitle>添加追踪股票</DialogTitle>
        <DialogContent>
          <TextField
            label="股票名称"
            fullWidth
            size="small"
            margin="normal"
            inputRef={nameRef}
          ></TextField>
          <TextField
            label="股票代码"
            fullWidth
            size="small"
            margin="normal"
            inputRef={codeRef}
          ></TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
          >
            取消
          </Button>
          <Button onClick={confirm}>确认</Button>
        </DialogActions>
      </Dialog>
      <AddPoint type={actionType} onClose={() => setActionType(null)} onAdd={handleAdd} />
    </Box>
  );
}

function AddPoint(props: {
  type: IStockActionType | null;
  onClose: () => void;
  onAdd: (price: number, share: number) => void;
}) {
  const priceRef = useRef<any>();
  const shareRef = useRef<any>();

  function confirm() {
    props.onAdd(priceRef.current.value * 1, shareRef.current.value * 1);
  }

  return (
    <Dialog open={props.type !== null}>
      <DialogTitle>{`添加${props.type === BUY ? '买' : '卖'}点`}</DialogTitle>
      <DialogContent>
        <TextField
          size="small"
          margin="normal"
          fullWidth
          label="价格"
          inputRef={priceRef}
        ></TextField>
        <TextField
          size="small"
          margin="normal"
          fullWidth
          label="份额"
          inputRef={shareRef}
        ></TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>取消</Button>
        <Button onClick={confirm}>确认</Button>
      </DialogActions>
    </Dialog>
  );
}

function Points(props: { stock: Stock }) {
  return (
    <Box sx={{ flexWrap: 'wrap' }}>
      {props.stock.entries
        .filter(_ => _.share > 0)
        .map((_, i) => {
          return (
            <Badge
              badgeContent={0}
              color="primary"
              key={i}
              sx={{ marginRight: '12px', marginTop: '8px' }}
            >
              <Chip
                variant="outlined"
                color={(_.floatingProfit || 0) > 0 ? 'error' : 'success'}
                label={`入场价格：${_.price}；${
                  _.share === 0 ? '' : '份额' + _.share + '；'
                }浮动盈亏：${_.floatingProfit}`}
              />
            </Badge>
          );
        })}
      <Divider sx={{ marginTop: '16px', marginBottom: '16px' }}>已清仓</Divider>
      {props.stock.entries
        .filter(_ => _.share === 0)
        .map((_, i) => {
          return (
            <Badge
              badgeContent="清仓"
              color="primary"
              key={i}
              sx={{ marginRight: '12px', marginTop: '8px' }}
            >
              <Chip
                variant="outlined"
                color={(_.floatingProfit || 0) > 0 ? 'error' : 'success'}
                label={`入场价格：${_.price}；${
                  _.share === 0 ? '' : '份额' + _.share + '；'
                }盈亏：${_.floatingProfit}`}
              />
            </Badge>
          );
        })}
    </Box>
  );
}
