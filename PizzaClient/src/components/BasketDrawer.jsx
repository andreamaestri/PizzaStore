import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	Divider,
	Drawer,
	IconButton,
	Stack,
	Typography,
} from "@mui/material";
import React, { useCallback, useMemo, memo } from "react";
import { useBasket } from "../context/BasketContext";

const BasketDrawer = memo(({ open, onClose, onCheckout }) => {
	const { items, removeFromBasket, updateQuantity, clearBasket } = useBasket();

	const total = useMemo(() => {
		return items.reduce((sum, i) => sum + i.pizza.price * i.quantity, 0);
	}, [items]);

	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	const handleCheckout = useCallback(() => {
		onCheckout();
	}, [onCheckout]);

	const handleClearBasket = useCallback(() => {
		clearBasket();
	}, [clearBasket]);

	const handleUpdateQuantity = useCallback(
		(pizzaId, newQuantity) => {
			updateQuantity(pizzaId, newQuantity);
		},
		[updateQuantity],
	);

	const handleRemoveFromBasket = useCallback(
		(pizzaId) => {
			removeFromBasket(pizzaId);
		},
		[removeFromBasket],
	);

	const drawerSx = useMemo(
		() => ({
			zIndex: 3500,
		}),
		[],
	);

	const modalProps = useMemo(
		() => ({
			keepMounted: true,
			BackdropProps: { sx: { zIndex: 3400 } },
		}),
		[],
	);

	const paperProps = useMemo(
		() => ({
			sx: {
				width: { xs: "100%", sm: 370 },
				height: "100%",
				zIndex: 3500,
				boxShadow:
					"0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)",
			},
		}),
		[],
	);

	const headerSx = useMemo(
		() => ({
			px: 3,
			py: 2,
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			borderBottom: "1px solid",
			borderColor: "divider",
			bgcolor: "primary.light",
			color: "primary.contrastText",
		}),
		[],
	);

	const headerIconButtonSx = useMemo(
		() => ({
			color: "inherit",
			"&:hover": {
				bgcolor: "rgba(255, 255, 255, 0.1)",
			},
		}),
		[],
	);

	const contentBoxSx = useMemo(
		() => ({
			p: 3,
			pt: 2,
			flex: 1,
			overflow: "auto",
			display: "flex",
			flexDirection: "column",
		}),
		[],
	);

	const footerBoxSx = useMemo(() => ({ p: 3, pt: 2 }), []);

	const totalTypographySx = useMemo(() => ({ mb: 2 }), []);

	const emptyBasketTypography = useMemo(
		() => <Typography color="text.secondary">Basket is empty.</Typography>,
		[],
	);

	const itemsStack = useMemo(
		() => (
			<Stack spacing={2}>
				{items.map(({ pizza, quantity }) => (
					<Box
						key={pizza.id}
						sx={{ display: "flex", alignItems: "center", gap: 2 }}
					>
						<Box sx={{ flex: 1 }}>
							<Typography fontWeight={500}>{pizza.name}</Typography>
							<Typography variant="body2" color="text.secondary">
								{pizza.description}
							</Typography>
							<Typography variant="caption">
								${pizza.price.toFixed(2)} x {quantity}
							</Typography>
						</Box>
						<Button
							size="small"
							onClick={() =>
								handleUpdateQuantity(pizza.id, Math.max(1, quantity - 1))
							}
							disabled={quantity <= 1}
						>
							-
						</Button>
						<Typography>{quantity}</Typography>
						<Button
							size="small"
							onClick={() => handleUpdateQuantity(pizza.id, quantity + 1)}
						>
							+
						</Button>
						<IconButton onClick={() => handleRemoveFromBasket(pizza.id)}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
				))}
			</Stack>
		),
		[items, handleUpdateQuantity, handleRemoveFromBasket],
	);

	const drawerContent = useMemo(
		() => (
			<>
				<Box sx={headerSx}>
					<Typography variant="h6" sx={{ fontWeight: 500 }}>
						Your Order
					</Typography>
					<IconButton
						onClick={handleClose}
						aria-label="close basket"
						sx={headerIconButtonSx}
					>
						<CloseIcon />
					</IconButton>
				</Box>
				<Box sx={contentBoxSx}>
					{items.length === 0 ? emptyBasketTypography : itemsStack}
				</Box>
				<Divider />
				<Box sx={footerBoxSx}>
					<Typography fontWeight={600} sx={totalTypographySx}>
						Total: ${total.toFixed(2)}
					</Typography>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						disabled={items.length === 0}
						onClick={handleCheckout}
						sx={{ mb: 1, minWidth: 140, fontWeight: 600, borderRadius: 2.5 }}
					>
						Checkout
					</Button>
					<Button
						variant="outlined"
						color="secondary"
						fullWidth
						disabled={items.length === 0}
						onClick={handleClearBasket}
						sx={{ minWidth: 120, fontWeight: 600, borderRadius: 2.5 }}
					>
						Clear Basket
					</Button>
				</Box>
			</>
		),
		[
			headerSx,
			headerIconButtonSx,
			contentBoxSx,
			items,
			emptyBasketTypography,
			itemsStack,
			Divider,
			footerBoxSx,
			total,
			handleCheckout,
			handleClearBasket,
			handleClose,
		],
	);

	return (
		<Drawer
			anchor="right"
			open={open}
			onClose={handleClose}
			variant="temporary"
			ModalProps={modalProps}
			PaperProps={paperProps}
			sx={drawerSx}
		>
			{drawerContent}
		</Drawer>
	);
});

export default BasketDrawer;
