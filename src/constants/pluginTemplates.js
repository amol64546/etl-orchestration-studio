export const PLUGIN_TEMPLATES = {


  "source": {
    "FakeSource": {
      "row.num": 10,
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "age": "int"
        }
      }
    },
    "PostgreSQL": {
      "plugin_name": "Jdbc",
      "url": "jdbc:postgresql://host:5432/seatunnel",
      "driver": "org.postgresql.Driver",
      "user": "root",
      "password": "root",
      "query": "select * from person"
    },
    "Kafka": {
      "bootstrap.servers": "host:9092",
      "topic": "test_topic",
      "schema": {
        "fields": {
          "id": "string",
          "name": "string",
          "age": "int"
        }
      }
    },
    "MongoDB": {
      "uri": "mongodb://host:27017",
      "database": "marketplace",
      "collection": "product",
      "schema": {
        "fields": {
          "_id": "string",
          "name": "string"
        }
      }
    },
    "TiDB": {
      "plugin_name": "Jdbc",
      "driver": "com.mysql.cj.jdbc.Driver",
      "url": "jdbc:mysql://host:4000",
      "user": "root",
      "password": "root",
      "query": "select * from seatunnel.person"
    },
    "TiDB-CDC": {
      "base-url": "jdbc:mysql://host:4000/test",
      "driver": "com.mysql.cj.jdbc.Driver",
      "pd-addresses": "basic-pd-0:2379",
      "username": "root",
      "password": "root",
      "database-name": "test",
      "table-name": "test"
    },
    "Cassandra": {
      "host": "host:9042",
      "username": "root",
      "password": "root",
      "keyspace": "test",
      "cql": "select * from source_table"
    },
    "Mysql": {
      "plugin_name": "Jdbc",
      "driver": "com.mysql.cj.jdbc.Driver",
      "url": "jdbc:mysql://host:3306",
      "user": "root",
      "password": "root",
      "query": "select * from seatunnel.person"
    },
    "MySQL-CDC": {
      "base-url": "jdbc:mysql://host:3306",
      "username": "root",
      "password": "root",
      "table-names": ["seatunnel.person"]
    },
    "Oracle": {
      "plugin_name": "Jdbc",
      "url": "jdbc:oracle:thin:@//host:1521",
      "user": "root",
      "password": "root",
      "driver": "oracle.jdbc.OracleDriver",
      "query": "select * from person"
    },
    "Redis_Single": {
      "plugin_name": "Redis",
      "port": "6379",
      "auth": "root",
      "host": "host",
      "data_type": "key",
      "mode": "single",
      "format": "json",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      },
      "keys": "seatunnel*"
    },
    "Redis_Cluster": {
      "plugin_name": "Redis",
      "auth": "root",
      "nodes": ["host:6379"],
      "data_type": "key",
      "mode": "cluster",
      "format": "json",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      },
      "keys": "seatunnel*"
    },
    "Elasticsearch": {
      "hosts": ["http://host:9200"],
      "username": "root",
      "password": "root",
      "index": "temperature",
      "query": "{\"range\": {\"c_int\": {\"gte\": 10, \"lte\": 20}}}"
    },
    "AmazonDynamoDB": {
      "access_key_id": "****",
      "secret_access_key": "****",
      "region": "ap-south-1",
      "url": "https://dynamodb.ap-south-1.amazonaws.com/",
      "table": "TableName"
    },
    "Http": {
      "url": "https://run.mocky.io/v3/6a1d8ea3-5fc8-4631-972e-af01e66309f6",
      "headers": {
        "Content-Type": "application/json"
      },
      "content_field": "$",
      "method": "GET",
      "format": "json",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      }
    },
    "Neo4j": {
      "uri": "bolt://host:7687",
      "username": "root",
      "password": "root",
      "database": "seatunnel",
      "query": "MATCH (p:Person) RETURN p.name, p.age, p.city",
      "schema": {
        "fields": {
          "p.name": "STRING",
          "p.age": "INT",
          "p.city": "STRING"
        }
      }
    },
    "Github": {
      "url": "https://raw.githubusercontent.com/amol64546/websocket/main/README.md",
      "method": "GET",
      "access_token": "****"
    },
    "Gitlab": {
      "url": "https://gitlab.com/api/v4/projects",
      "method": "GET",
      "access_token": "****"
    },
    "Notion": {
      "url": "https://api.notion.com/v1/users",
      "password": "****",
      "version": "2022-06-28",
      "content_field": "$.results.*",
      "format": "json",
      "schema": {
        "fields": {
          "id": "string",
          "name": "string",
          "person": {
            "email": "string"
          }
        }
      }
    },
    "Jira": {
      "url": "https://test.atlassian.net/rest/api/3/issue/{issueId}",
      "email": "test@gmail.com",
      "api_token": "****"
    },
    "Klaviyo": {
      "url": "https://a.klaviyo.com/api/lists",
      "method": "GET",
      "private_key": "****",
      "revision": "2023-10-15"
    },
    "Lemlist": {
      "url": "https://api.lemlist.com/api/campaigns",
      "password": "****",
      "format": "json",
      "schema": {
        "fields": {
          "_id": "string",
          "name": "string"
        }
      }
    },
    "MyHours": {
      "url": "https://api2.myhours.com/api/Projects/getAll",
      "email": "riteshar03@gmail.com",
      "password": "Ritesh@1415",
      "format": "json",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "clientName": "string"
        }
      }
    },
    "Postgres-CDC": {
      "base-url": "jdbc:host:5432/seatunnel",
      "username": "root",
      "password": "root",
      "database-names": ["seatunnel"],
      "schema-names": ["public"],
      "table-names": ["seatunnel.public.person"],
      "slot.name": "person"
    },
    "MongoDB-CDC": {
      "hosts": "host:27017",
      "username": "root",
      "password": "root",
      "database": ["seatunnel"],
      "collection": ["seatunnel.person"],
      "schema": {
        "table": "seatunnel.person",
        "fields": {
          "_id": "string",
          "name": "string",
          "age": "int"
        }
      }
    },
    "SftpFile": {
      "host": "host",
      "port": 2232,
      "user": "root",
      "password": "root",
      "path": "/root/test.json",
      "file_format_type": "json",
      "field_delimiter": "#",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      }
    },
    "OneSignal": {
      "url": "https://onesignal.com/api/v1/apps/7ba22d65-476f-4553-8e85-4f17591b9f26",
      "password": "os_v2_app_porc2zkhn5cvhdufj4lvsg47e2hyxmpdxfruxdmamsag7lgxj37nytqs63gk2jxw7gn7fm6smeuhzeezikwxv342zxe65j4memhm36q"
    },
    "FtpFile": {
      "host": "host",
      "port": 21,
      "user": "ftpuser",
      "password": "ritesh@1415",
      "path": "/data/test.csv",
      "file_format_type": "text",
      "field_delimiter": "#",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      }
    },
    "GraphQL": {
      "format": "json",
      "content_field": "$.data.post",
      "url": "https://graphqlzero.almansi.me/api",
      "query": "query { post(id: 1) { id title body } }",
      "variables": {},
      "schema": {
        "fields": {
          "id": "string",
          "title": "string",
          "body": "string"
        }
      }
    },
    "AmazonDynamoDB2": {
      "url": "https://dynamodb.us-east-1.amazonaws.com",
      "region": "us-east-1",
      "access_key_id": "****",
      "secret_access_key": "****",
      "table": "SeatunnelDynamo",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "role": "string"
        }
      }
    },
    "Prometheus": {
      "url": "http://host:9090",
      "query": "up",
      "query_type": "Instant",
      "content_field": "$.data.result.*",
      "format": "json",
      "schema": {
        "fields": {
          "metric": "map<string, string>",
          "value": "double",
          "time": "long"
        }
      }
    },
    "Pulsar": {
      "topic": "topic",
      "subscription.name": "my-subscription",
      "client.service-url": "pulsar://host:6650",
      "admin.service-url": "http://host:8080",
      "schema": {
        "fields": {
          "msg": "string"
        }
      }
    },
    "LocalFile": {
      "schema": {
        "fields": {
          "name": "string",
          "project": "string"
        }
      },
      "path": "/opt/seatunnel/temp/test.json",
      "file_format_type": "json"
    },
    "Rocketmq": {
      "name.srv.addr": "host:9876",
      "topics": "test-topic",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string"
        }
      }
    },
    "Redshift": {
      "plugin_name": "Jdbc",
      "url": "jdbc:redshift://seatunnel.703671894654.us-east-1.redshift-serverless.amazonaws.com:5439/dev",
      "driver": "com.amazon.redshift.jdbc.Driver",
      "user": "admin",
      "password": "Seatunnel123",
      "query": "SELECT id, name, age FROM public.users"
    },
    "RabbitMQ": {
      "host": "host",
      "port": 5672,
      "virtual_host": "/",
      "username": "guest",
      "password": "guest",
      "queue_name": "test-queue",
      "durable": true,
      "exclusive": false,
      "auto_delete": false,
      "schema": {
        "fields": {
          "id": "int",
          "name": "string"
        }
      }
    },
    "Phoenix": {
      "plugin_name": "Jdbc",
      "driver": "org.apache.phoenix.queryserver.client.Driver",
      "url": "jdbc:phoenix:thin:url=http://10.42.115.238:8765;serialization=PROTOBUF;namespaceMappingEnabled=true",
      "query": "SELECT age, name FROM test.source"
    },
    "AmazonSqs": {
      "url": "https://sqs.us-east-1.amazonaws.com/703671894654/seatunnel",
      "access_key_id": "****",
      "secret_access_key": "****",
      "region": "us-east-1",
      "format": "text",
      "field_delimiter": "#",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "age": "int",
          "date": "date",
          "timestamp": "timestamp"
        }
      }
    },
    "Socket": {
      "host": "127.0.0.1",
      "port": "9999"
    },
    "GoogleSheets": {
      "service_account_key": "google service account key",
      "sheet_id": "10LhOdatMk7Or1dJGstIkF-r0FYx4wijriq9GqN7WYfc",
      "sheet_name": "Sheet1",
      "range": "A1:C5",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "department": "string"
        }
      }
    },
    "Persistiq": {
      "password": "f17d889b796af096932b9a0d8c205a971123",
      "url": "https://api.persistiq.com/v1/leads/60AGgZ3Z2mXnV3QR4j9a",
      "format": "json",
      "method": "GET",
      "headers": {
        "x-api-key": "f17d889b796af096932b9a0d8c205a971123"
      },
      "content_field": "$.lead.data",
      "schema": {
        "fields": {
          "email": "string",
          "first_name": "string"
        }
      }
    },
    "S3File": {
      "bucket": "s3a://seatunnel1",
      "path": "/seatunnel.csv",
      "access_key": "****",
      "secret_key": "****",
      "region": "us-east-1",
      "fs.s3a.endpoint": "s3.us-east-1.amazonaws.com",
      "fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider",
      "file_format_type": "csv",
      "field_delimiter": ",",
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "age": "int"
        }
      }
    },
    "DB2": {
      "plugin_name": "Jdbc",
      "url": "jdbc:db2://db2-service.seatunnel.svc.cluster.local:50000/stunnel",
      "driver": "com.ibm.db2.jcc.DB2Driver",
      "user": "db2inst1",
      "password": "seatunnel",
      "query": "SELECT * FROM student"
    },
    "Iceberg": {
      "catalog_name": "seatunnel_test",
      "namespace": "seatunnel",
      "table": "iceberg_sink_table",
      "iceberg.catalog.config": {
        "type": "hadoop",
        "warehouse": "s3a://iceberg/",
        "fs.s3a.endpoint": "http://minio:9000",
        "fs.s3a.access.key": "minioadmin",
        "fs.s3a.secret.key": "minioadmin",
        "fs.s3a.path.style.access": "true",
        "fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"
      },
      "hadoop.config": {
        "fs.s3a.endpoint": "http://minio:9000",
        "fs.s3a.access.key": "minioadmin",
        "fs.s3a.secret.key": "minioadmin",
        "fs.s3a.path.style.access": "true",
        "fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"
      },
      "schema": {
        "fields": {
          "id": "int",
          "name": "string",
          "f_datetime": "string"
        }
      }
    },
    "HdfsFile": {
      "fs.defaultFS": "hdfs://my-hadoop-hadoop-hdfs-nn.seatunnel.svc.cluster.local:9000",
      "path": "/student",
      "file_format_type": "json",
      "schema": {
        "fields": {
          "name": "string",
          "age": "int"
        }
      }
    },
    "OceanBase": {
      "plugin_name": "Jdbc",
      "driver": "com.oceanbase.jdbc.Driver",
      "url": "jdbc:oceanbase://oceanbase.ocean.svc.cluster.local:2881",
      "user": "root",
      "password": "ocean",
      "compatible_mode": "mysql",
      "query": "SELECT * FROM person"
    }
  },


  transform: {
    "FilterFields": {
      "include_fields": ["name", "age"]
    },
    "CopyFields": {
      "fields": {
        "name1": "name",
        "name2": "name",
        "age1": "age"
      }
    },
    "SplitField": {
      "separator": " ",
      "split_field": "name",
      "output_fields": "first_name, second_name"
    },
    "Sql": {
      "query": "select age,company from FakeSource where age <58;"
    },
    "FieldRename": {
      "convert_case": "UPPER",
      "prefix": "U_"
    },
    "FilterRowKind1": {
      "include_kinds": ["INSERT", "UPDATE_AFTER"]
    },
    "DynamicCompile": {
      "compile_language": "JAVA",
      "compile_pattern": "SOURCE_CODE",
      "source_code": "import org.apache.seatunnel.api.table.catalog.Column;\nimport org.apache.seatunnel.api.table.type.SeaTunnelRowAccessor;\nimport org.apache.seatunnel.api.table.catalog.*;\nimport org.apache.seatunnel.api.table.type.*;\n\npublic Column[] getInlineOutputColumns(CatalogTable inputCatalogTable) {\n    PhysicalColumn col1 = PhysicalColumn.of(\n        \"name\", BasicType.STRING_TYPE, 100L, true, \"\", \"\"\n    );\n    PhysicalColumn col2 = PhysicalColumn.of(\n        \"compile_language\", BasicType.STRING_TYPE, 10L, true, \"\", \"\"\n    );\n    return new Column[]{ col1, col2 };\n}\n\npublic Object[] getInlineOutputFieldValues(SeaTunnelRowAccessor inputRow) {\n    Object[] fieldValues = new Object[2];\n    String name = inputRow.getField(0).toString();\n    fieldValues[0] = name.toUpperCase();\n    fieldValues[1] = \"JAVA\";\n    return fieldValues;\n}"
    },
    "JsonPath": {
      "row_error_handle_way": "FAIL",
      "columns": [
        {
          "src_field": "col",
          "path": "$[0]",
          "dest_field": "name",
          "dest_type": "string"
        },
        {
          "src_field": "col",
          "path": "$[1]",
          "dest_field": "age",
          "dest_type": "int"
        }
      ]
    },
    "RowKindExtractor": {
      "field_name": "row_kind"
    },
    "FilterRowKind2": {
      "include_kinds": ["UPDATE_AFTER"]
    },
    "TableRename": {
      "table_name": "customer_data"
    },
    "LLM": {
      "model_provider": "OPENAI",
      "model": "gpt-4o",
      "api_key": "****",
      "prompt_template": "Guess the gender of a person named {{name}}."
    },
    "Replace": {
      "replace_field": "name",
      "pattern": " ",
      "replacement": "\\$",
      "is_regex": true,
      "replace_first": false
    },
    "FieldMapper": {
      "field_mapper": {
        "name": "new_name",
        "age": "age",
        "city": "city"
      }
    },
    "Metadata": {
      "metadata_fields": {
        "RowKind": "row_kind",
        "EventTime": "event_time"
      }
    },
    "Embedding": {
      "model_provider": "CUSTOM",
      "model": "gemini-embedding-exp-03-07",
      "api_key": "token",
      "api_path": "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent",
      "single_vectorized_input_number": "1",
      "vectorization_fields": {
        "book_intro_vector": "book_intro"
      },
      "custom_config": {
        "custom_response_parse": "$.embedding.values",
        "custom_request_headers": {
          "Content-Type": "application/json",
          "x-goog-api-key": "token"
        },
        "custom_request_body": {
          "model": "models/${model}",
          "content": {
            "parts": [
              {
                "text": "${input}"
              }
            ]
          }
        }
      }
    },
    "TableMerge": {
      "table_match_regex": "source.user_.*",
      "database": "user_db",
      "table": "user_all"
    },
    "TableFilter": {
      "database_pattern": "test",
      "table_pattern": "user_\\d+"
    }
  },

  sink: {
    "PostgreSQL": {
      "plugin_name": "Jdbc",
      "driver": "org.postgresql.Driver",
      "user": "root",
      "password": "root",
      "generate_sink_sql": true,
      "url": "jdbc:postgresql://host:5432/seatunnel",
      "database": "seatunnel",
      "table": "public.person",
      "primary_keys": ["id"]
    },
    "Kafka": {
      "bootstrap.servers": "host:9092",
      "topic": "seatunnel"
    },
    "MongoDB": {
      "uri": "mongodb://host:27017",
      "database": "test_db",
      "collection": "users",
      "primary_key": ["id"]
    },
    "TiDB": {
      "plugin_name": "Jdbc",
      "url": "jdbc:mysql://host:4000/test",
      "driver": "com.mysql.cj.jdbc.Driver",
      "user": "root",
      "password": "root",
      "generate_sink_sql": true,
      "database": "seatunnel",
      "table": "public.person",
      "primary_keys": ["id"]
    },
    "Cassandra": {
      "host": "host:9042",
      "username": "root",
      "password": "root",
      "keyspace": "test"
    },
    "Redis_Single": {
      "plugin_name": "Redis",
      "host": "host",
      "port": "6379",
      "auth": "root",
      "key": "age",
      "data_type": "list"
    },
    "Redis_Cluster": {
      "plugin_name": "Redis",
      "auth": "root",
      "nodes": ["host:6379"],
      "mode": "cluster",
      "key": "age",
      "data_type": "list"
    },
    "Mysql": {
      "plugin_name": "Jdbc",
      "url": "jdbc:mysql://host:3306/test",
      "driver": "com.mysql.cj.jdbc.Driver",
      "user": "root",
      "password": "root",
      "generate_sink_sql": true,
      "database": "test",
      "table": "test_table",
      "primary_keys": ["id"]
    },
    "Oracle": {
      "plugin_name": "Jdbc",
      "password": "root",
      "driver": "oracle.jdbc.OracleDriver",
      "user": "root",
      "url": "jdbc:oracle:thin:@//host:1521",
      "generate_sink_sql": true,
      "database": "test",
      "table": "test_table",
      "primary_keys": ["id"]
    },
    "Elasticsearch": {
      "hosts": ["http://host:9200"],
      "username": "root",
      "password": "root",
      "index": "temperature",
      "primary_keys": ["id"]
    },
    "Neo4j": {
      "uri": "bolt://host:7687",
      "username": "root",
      "password": "root",
      "database": "neo4j",
      "query": "CREATE (p:Person {name: $name, age: $age, city: $city})",
      "queryParamPosition": {
        "name": 0,
        "age": 1,
        "city": 2
      }
    },
    "Http": {
      "url": "https://webhook.site/00500252-b3b9-4ecb-99e9-2ba8cbc28d5e",
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "LocalFile": {
      "path": "/opt/seatunnel/temp/output",
      "file_format_type": "json"
    },
    "SftpFile": {
      "host": "host",
      "port": 2232,
      "user": "root",
      "password": "root",
      "path": "/root/seatunnel",
      "tmp_path": "/root/seatunnel/tmp",
      "file_format_type": "json",
      "file_name_expression": "test",
      "support_column_projection": false,
      "is_enable_transaction": false
    },
    "FtpFile": {
      "host": "host",
      "port": 21,
      "user": "ftpuser",
      "password": "ritesh@1415",
      "path": "/data/output",
      "tmp_path": "/data/tmp",
      "file_format_type": "text",
      "field_delimiter": "\t",
      "row_delimiter": "\n",
      "sink_columns": ["name", "age"]
    },
    "GraphQL": {
      "url": "http://10.43.127.7:8080/graphql",
      "method": "POST",
      "headers": {
        "Content-Type": "application/json"
      },
      "query": "mutation AddBook($title: String!, $author: String!) { addBook(title: $title, author: $author) { id title author } }",
      "variables": {
        "title": "${title}",
        "author": "${author}"
      }
    },
    "AmazonDynamoDB": {
      "url": "https://dynamodb.us-east-1.amazonaws.com",
      "region": "us-east-1",
      "access_key_id": "****",
      "secret_access_key": "****",
      "table": "SeatunnelDynamo"
    },
    "Pulsar": {
      "topic": "topic",
      "client.service-url": "pulsar://host:6650",
      "admin.service-url": "http://host:8080"
    },
    "EmailSink": {
      "email_from_address": "nakhate.a@mobiusdtaas.ai",
      "email_to_address": "amol64546@gmail.com",
      "email_host": "smtp.gmail.com",
      "email_transport_protocol": "smtp",
      "email_smtp_auth": "true",
      "email_authorization_code": "access_token",
      "email_message_headline": "hi",
      "email_message_content": "hi"
    },
    "Prometheus": {
      "url": "http://host:9090/api/v1/write",
      "key_label": "labels",
      "key_value": "value",
      "key_timestamp": "ts",
      "batch_size": 1
    },
    "RocketMQ": {
      "name.srv.addr": "host:9876",
      "topic": "test-topic"
    },
    "ActiveMQ": {
      "uri": "tcp://host:61616",
      "username": "root",
      "password": "root",
      "queue_name": "test-queue"
    },
    "Redshift": {
      "plugin_name": "Jdbc",
      "url": "jdbc:redshift://seatunnel.703671894654.us-east-1.redshift-serverless.amazonaws.com:5439/dev",
      "driver": "com.amazon.redshift.jdbc.Driver",
      "user": "admin",
      "database": "dev",
      "password": "Seatunnel123",
      "generate_sink_sql": true,
      "schema": "public",
      "table": "users"
    },
    "RabbitMQ": {
      "host": "host",
      "port": 5672,
      "virtual_host": "/",
      "username": "guest",
      "password": "guest",
      "queue_name": "test-queue",
      "durable": true,
      "exclusive": false,
      "auto_delete": false
    },
    "Phoenix": {
      "plugin_name": "Jdbc",
      "driver": "org.apache.phoenix.queryserver.client.Driver",
      "url": "jdbc:phoenix:thin:url=http://10.42.115.238:8765;serialization=PROTOBUF;namespaceMappingEnabled=true",
      "query": "UPSERT INTO test.source (id, name, age) VALUES (?, ?, ?)"
    },
    "AmazonSqs": {
      "url": "https://sqs.us-east-1.amazonaws.com/703671894654/seatunnel",
      "access_key_id": "****",
      "secret_access_key": "****",
      "region": "us-east-1",
      "queue": "seatunnel",
      "format": "text",
      "field_delimiter": "#"
    },
    "Socket": {
      "host": "127.0.0.1",
      "port": "9998"
    },
    "S3File": {
      "bucket": "s3a://seatunnel1",
      "path": "/output/data.csv",
      "access_key": "****",
      "secret_key": "****",
      "region": "us-east-1",
      "fs.s3a.endpoint": "s3.us-east-1.amazonaws.com",
      "fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider",
      "file_format_type": "csv",
      "field_delimiter": ","
    },
    "DB2": {
      "plugin_name": "Jdbc",
      "url": "jdbc:db2://db2-service.seatunnel.svc.cluster.local:50000/stunnel",
      "driver": "com.ibm.db2.jcc.DB2Driver",
      "user": "db2inst1",
      "password": "seatunnel",
      "query": "INSERT INTO test_table(name, age) VALUES (?, ?)"
    },
    "Iceberg": {
      "catalog_name": "seatunnel_test",
      "iceberg.catalog.config": {
        "type": "hadoop",
        "warehouse": "s3a://iceberg/"
      },
      "namespace": "seatunnel",
      "table": "iceberg_sink_table",
      "iceberg.table.write-props": {
        "write.format.default": "parquet",
        "write.target-file-size-bytes": 536870912
      },
      "iceberg.table.primary-keys": "id",
      "iceberg.table.partition-keys": "f_datetime",
      "iceberg.table.upsert-mode-enabled": true,
      "iceberg.table.schema-evolution-enabled": true,
      "case_sensitive": true,
      "hadoop.config": {
        "fs.s3a.endpoint": "http://minio:9000",
        "fs.s3a.access.key": "minioadmin",
        "fs.s3a.secret.key": "minioadmin",
        "fs.s3a.path.style.access": "true",
        "fs.s3a.aws.credentials.provider": "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider"
      }
    },
    "HdfsFile": {
      "fs.defaultFS": "hdfs://my-hadoop-hadoop-hdfs-nn.seatunnel.svc.cluster.local:9000",
      "path": "/student_output",
      "file_format_type": "json"
    },
    "OceanBase": {
      "plugin_name": "Jdbc",
      "driver": "com.oceanbase.jdbc.Driver",
      "url": "jdbc:oceanbase://oceanbase.ocean.svc.cluster.local:2881/seatunnel",
      "user": "root",
      "password": "ocean",
      "compatible_mode": "mysql",
      "generate_sink_sql": true,
      "database": "seatunnel",
      "table": "person"
    }
  }

};