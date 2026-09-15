-- Estrutura (sem dados) das tabelas do site que a API vai LER.
-- Extraído do dump real do MySQL de produção em 2026-09-15, mantendo tipos e nomes exatos.
-- Este script só recria a estrutura, para desenvolvimento local — nenhum dado de cliente aqui.

SET NAMES utf8mb4;

CREATE TABLE `categorias` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL DEFAULT 'pin',
  `descricao` text,
  `ordem` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `lugares` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `empresa_id` int UNSIGNED DEFAULT NULL,
  `slug` varchar(160) NOT NULL,
  `nome` varchar(160) NOT NULL,
  `descricao` text,
  `descricao_extra` text,
  `categoria_id` int UNSIGNED NOT NULL,
  `cat_label` varchar(100) DEFAULT NULL,
  `badge` varchar(50) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lng` decimal(10,7) DEFAULT NULL,
  `telefone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `site` varchar(255) DEFAULT NULL,
  `instagram` varchar(100) DEFAULT NULL,
  `facebook` varchar(120) DEFAULT NULL,
  `tiktok` varchar(120) DEFAULT NULL,
  `google_place_id` varchar(255) DEFAULT NULL,
  `google_synced_at` datetime DEFAULT NULL,
  `whatsapp` varchar(30) DEFAULT NULL,
  `preco_nivel` enum('barato','medio','alto','luxo') DEFAULT 'medio',
  `preco_simbolo` varchar(10) DEFAULT 'R$$',
  `preco_range` varchar(80) DEFAULT NULL,
  `foto_principal` varchar(255) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT '0.0',
  `total_reviews` int UNSIGNED DEFAULT '0',
  `rating_qualidade` decimal(2,1) DEFAULT '0.0',
  `rating_localizacao` decimal(2,1) DEFAULT '0.0',
  `rating_atendimento` decimal(2,1) DEFAULT '0.0',
  `rating_custo` decimal(2,1) DEFAULT '0.0',
  `aberto_agora` tinyint(1) DEFAULT '0',
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `destaque` tinyint(1) NOT NULL DEFAULT '0',
  `plano` enum('essencial','profissional','premium') NOT NULL DEFAULT 'essencial',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `endereco_numero` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_categoria` (`categoria_id`),
  KEY `idx_ativo` (`ativo`),
  KEY `idx_destaque` (`destaque`),
  CONSTRAINT `fk_lugar_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `fotos` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `lugar_id` int UNSIGNED NOT NULL,
  `url` varchar(255) NOT NULL,
  `alt` varchar(160) DEFAULT NULL,
  `principal` tinyint(1) NOT NULL DEFAULT '0',
  `ordem` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lugar` (`lugar_id`),
  CONSTRAINT `fk_foto_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugares` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `horarios` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `lugar_id` int UNSIGNED NOT NULL,
  `dia_semana` tinyint NOT NULL,
  `hora_abre` time DEFAULT NULL,
  `hora_fecha` time DEFAULT NULL,
  `fechado` tinyint(1) NOT NULL DEFAULT '0',
  `dia_todo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lugar_dia` (`lugar_id`,`dia_semana`),
  CONSTRAINT `fk_horario_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugares` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `avaliacoes` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `lugar_id` int UNSIGNED NOT NULL,
  `fonte` enum('google','tripadvisor','manual') NOT NULL DEFAULT 'manual',
  `fonte_id` varchar(100) DEFAULT NULL,
  `autor_nome` varchar(100) DEFAULT NULL,
  `autor_foto` varchar(255) DEFAULT NULL,
  `nota` decimal(2,1) NOT NULL DEFAULT '5.0',
  `texto` text,
  `data_avaliacao` date DEFAULT NULL,
  `aprovado` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fonte_id` (`fonte`,`fonte_id`),
  KEY `idx_lugar` (`lugar_id`),
  KEY `idx_aprovado` (`lugar_id`,`aprovado`),
  CONSTRAINT `fk_avaliacao_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugares` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `servicos` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome` varchar(80) NOT NULL,
  `icon` varchar(50) DEFAULT 'verified',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `lugar_servicos` (
  `lugar_id` int UNSIGNED NOT NULL,
  `servico_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`lugar_id`,`servico_id`),
  KEY `fk_ls_servico` (`servico_id`),
  CONSTRAINT `fk_ls_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ls_servico` FOREIGN KEY (`servico_id`) REFERENCES `servicos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tags` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` varchar(80) NOT NULL,
  `label` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `lugar_tags` (
  `lugar_id` int UNSIGNED NOT NULL,
  `tag_id` int UNSIGNED NOT NULL,
  PRIMARY KEY (`lugar_id`,`tag_id`),
  KEY `fk_lt_tag` (`tag_id`),
  CONSTRAINT `fk_lt_lugar` FOREIGN KEY (`lugar_id`) REFERENCES `lugares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lt_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Alguns dados fictícios só para testar as queries localmente (nenhum dado real de cliente).

INSERT INTO `categorias` (`slug`, `label`, `icon`, `ordem`) VALUES
('restaurantes', 'Restaurantes', 'utensils', 1),
('cafes', 'Cafés', 'coffee', 2),
('beleza', 'Beleza', 'scissors', 3);

INSERT INTO `lugares`
  (`slug`, `nome`, `descricao`, `categoria_id`, `endereco`, `bairro`, `lat`, `lng`, `whatsapp`, `rating`, `total_reviews`, `destaque`, `plano`)
VALUES
  ('cafe-exemplo', 'Café Exemplo', 'Um café de bairro, só para teste local.', 2, 'Rua Fictícia, 100', 'Campo Belo', -23.6250000, -46.6700000, '11999990000', 4.8, 12, 1, 'premium'),
  ('restaurante-exemplo', 'Restaurante Exemplo', 'Restaurante fictício para validar as queries.', 1, 'Rua Fictícia, 200', 'Campo Belo', -23.6240000, -46.6690000, '11999990001', 4.5, 30, 0, 'essencial');
