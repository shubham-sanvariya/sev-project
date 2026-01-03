export const userDTO = (user) => {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist,
        authProvider: user.authProvider,
        isActive: user.isActive, // optional, include if frontend needs it
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
