-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `profileImage` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `loyaltyPoints` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `label` VARCHAR(50) NOT NULL,
    `recipientName` VARCHAR(120) NOT NULL,
    `street` VARCHAR(160) NOT NULL,
    `number` VARCHAR(20) NOT NULL,
    `complement` VARCHAR(100) NULL,
    `neighborhood` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(2) NOT NULL,
    `zipCode` VARCHAR(9) NOT NULL,
    `reference` VARCHAR(200) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `addresses_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `image` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoryId` INTEGER NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10,  2) NOT NULL,
    `promotionalPrice` DECIMAL(10,  2) NULL,
    `image` VARCHAR(255) NULL,
    `sku` VARCHAR(60) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `preparationTime` INTEGER NULL,
    `calories` INTEGER NULL,
    `carbohydrates` DECIMAL(7,  2) NULL,
    `proteins` DECIMAL(7,  2) NULL,
    `fats` DECIMAL(7,  2) NULL,
    `fiber` DECIMAL(7,  2) NULL,
    `sodium` DECIMAL(9,  2) NULL,
    `ingredients` TEXT NULL,
    `allergens` TEXT NULL,
    `containsGluten` BOOLEAN NOT NULL DEFAULT false,
    `containsLactose` BOOLEAN NOT NULL DEFAULT false,
    `containsMilk` BOOLEAN NOT NULL DEFAULT false,
    `containsEggs` BOOLEAN NOT NULL DEFAULT false,
    `containsSoy` BOOLEAN NOT NULL DEFAULT false,
    `containsPeanuts` BOOLEAN NOT NULL DEFAULT false,
    `containsNuts` BOOLEAN NOT NULL DEFAULT false,
    `containsSugar` BOOLEAN NOT NULL DEFAULT false,
    `isVegetarian` BOOLEAN NOT NULL DEFAULT false,
    `isVegan` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_categoryId_idx`(`categoryId`),
    INDEX `products_isActive_isAvailable_idx`(`isActive`, `isAvailable`),
    INDEX `products_isFeatured_idx`(`isFeatured`),
    INDEX `products_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `favorites_userId_productId_key`(`userId`, `productId`),
    INDEX `favorites_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `promotionId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `carts_userId_key`(`userId`),
    INDEX `carts_promotionId_idx`(`promotionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cart_items_cartId_productId_key`(`cartId`, `productId`),
    INDEX `cart_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderNumber` VARCHAR(30) NOT NULL,
    `userId` INTEGER NOT NULL,
    `addressId` INTEGER NULL,
    `deliveryAddress` JSON NULL,
    `promotionId` INTEGER NULL,
    `couponCode` VARCHAR(50) NULL,
    `subtotal` DECIMAL(10,  2) NOT NULL,
    `discount` DECIMAL(10,  2) NOT NULL DEFAULT 0,
    `deliveryFee` DECIMAL(10,  2) NOT NULL DEFAULT 0,
    `total` DECIMAL(10,  2) NOT NULL,
    `paymentMethod` ENUM('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH') NOT NULL,
    `paymentStatus` ENUM('PENDING', 'APPROVED', 'DECLINED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `orderStatus` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `deliveryType` ENUM('DELIVERY', 'PICKUP') NOT NULL,
    `notes` VARCHAR(500) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    INDEX `orders_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `orders_orderStatus_idx`(`orderStatus`),
    INDEX `orders_paymentStatus_idx`(`paymentStatus`),
    INDEX `orders_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productName` VARCHAR(160) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(10,  2) NOT NULL,
    `subtotal` DECIMAL(10,  2) NOT NULL,

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL,
    `note` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_history_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `method` ENUM('PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'DECLINED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `amount` DECIMAL(10,  2) NOT NULL,
    `provider` VARCHAR(40) NOT NULL DEFAULT 'simulated',
    `transactionId` VARCHAR(80) NULL,
    `pixCode` TEXT NULL,
    `cardBrand` VARCHAR(30) NULL,
    `cardLast4` VARCHAR(4) NULL,
    `failureReason` VARCHAR(255) NULL,
    `paidAt` DATETIME(3) NULL,
    `refundedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_orderId_key`(`orderId`),
    UNIQUE INDEX `payments_transactionId_key`(`transactionId`),
    INDEX `payments_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `code` VARCHAR(50) NOT NULL,
    `type` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
    `value` DECIMAL(10,  2) NOT NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `perUserLimit` INTEGER NOT NULL DEFAULT 1,
    `minOrderValue` DECIMAL(10,  2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `promotions_code_key`(`code`),
    INDEX `promotions_isActive_startsAt_endsAt_idx`(`isActive`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promotion_usages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `promotionId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `discountAmount` DECIMAL(10,  2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `promotion_usages_orderId_key`(`orderId`),
    INDEX `promotion_usages_promotionId_userId_idx`(`promotionId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reviews_userId_productId_orderId_key`(`userId`, `productId`, `orderId`),
    INDEX `reviews_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `type` ENUM('ORDER_CREATED', 'ORDER_CONFIRMED', 'ORDER_PREPARING', 'ORDER_READY', 'ORDER_OUT_FOR_DELIVERY', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'PAYMENT', 'PROMOTION', 'REWARD', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `data` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_isRead_idx`(`userId`, `isRead`),
    INDEX `notifications_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_rewards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `description` VARCHAR(500) NULL,
    `pointsCost` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,
    `rewardId` INTEGER NULL,
    `type` ENUM('EARNED', 'REDEEMED', 'ADJUSTED') NOT NULL,
    `points` INTEGER NOT NULL,
    `balanceAfter` INTEGER NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `loyalty_transactions_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `loyalty_transactions_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revoked_tokens` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jti` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `revoked_tokens_jti_key`(`jti`),
    INDEX `revoked_tokens_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_items` ADD CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usages` ADD CONSTRAINT `promotion_usages_promotionId_fkey` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usages` ADD CONSTRAINT `promotion_usages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `promotion_usages` ADD CONSTRAINT `promotion_usages_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_transactions` ADD CONSTRAINT `loyalty_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loyalty_transactions` ADD CONSTRAINT `loyalty_transactions_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `loyalty_rewards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
