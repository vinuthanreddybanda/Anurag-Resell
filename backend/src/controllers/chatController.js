const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Product = require('../models/Product');
const AppError = require('../utils/appError');

// Get or Create a chat room
const getOrCreateChat = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.id;

    if (!productId) {
      return next(new AppError('Product ID is required to start a chat', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const sellerId = product.seller.toString();

    // Students cannot chat with themselves for buying their own products
    if (buyerId === sellerId) {
      return next(new AppError('You cannot start a chat room for your own product', 400));
    }

    // Try to find existing chat
    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: sellerId,
      product: productId,
    })
      .populate('buyer', 'name profilePicture')
      .populate('seller', 'name profilePicture')
      .populate('product', 'title price images isSold');

    // Create new chat if not existing
    if (!chat) {
      chat = await Chat.create({
        buyer: buyerId,
        seller: sellerId,
        product: productId,
      });

      // Populate after creation
      chat = await Chat.findById(chat._id)
        .populate('buyer', 'name profilePicture')
        .populate('seller', 'name profilePicture')
        .populate('product', 'title price images isSold');
    }

    res.status(200).json({
      status: 'success',
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// Get all chats for the logged-in user
const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find chats where the user is either the buyer or the seller
    const chats = await Chat.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('buyer', 'name profilePicture')
      .populate('seller', 'name profilePicture')
      .populate('product', 'title price images isSold')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name',
        },
      })
      .sort('-updatedAt');

    res.status(200).json({
      status: 'success',
      chats,
    });
  } catch (error) {
    next(error);
  }
};

// Get messages for a specific chat room
const getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError('Chat room not found', 404));
    }

    // Verify user is part of the chat room
    if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
      return next(new AppError('You do not have access to this conversation', 403));
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name profilePicture')
      .sort('createdAt');

    res.status(200).json({
      status: 'success',
      messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateChat,
  getUserChats,
  getChatMessages,
};
