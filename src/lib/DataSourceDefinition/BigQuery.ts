import { BigQuery as BigQueryClient } from "@google-cloud/bigquery";
import Base, { ConfigSchemasType } from "./Base";
import { flatten } from "lodash";
import { DataSourceKeys } from "../../renderer/pages/DataSource/DataSourceStore";

export default class BigQuery extends Base {
  _cancel: any;

  static get key(): DataSourceKeys {
    return "bigquery";
  }
  static get label(): string {
    return "BigQuery";
  }
  static get configSchema(): ConfigSchemasType {
    return [
      {
        name: "projectId",
        label: "Project Id",
        type: "string",
        placeholder: "your-project-id"
      },
      {
        name: "keyFilename",
        label: "JSON Key File",
        type: "string",
        placeholder: "/path/to/keyfile.json"
      }
    ];
  }

  get client(): BigQueryClient {
    return new BigQueryClient(this.config);
  }

  execute(query: string): Promise<any> {
    this._cancel = null;
    return new Promise((resolve, reject) => {
      this.client.createQueryJob(query, (err, job) => {
        if (err) return reject(err);
        if (!job) return reject("Invalid job");

        this._cancel = async (): Promise<void> => {
          await job.cancel();
          reject(new Error("Query is canceled"));
        };

        job.getQueryResults((err, rows) => {
          if (err) return reject(err);
          if (!rows || rows.length === 0) return resolve({});

          resolve({
            fields: Object.keys(rows[0]),
            rows: rows.map(row => {
              return Object.values(row).map((v: any) => (v != null && v.value !== undefined ? v.value : v));
            })
          });
        });
      });
    });
  }

  cancel(): void {
    return this._cancel && this._cancel();
  }

  async connectionTest(): Promise<void> {
    await this.client.query("select 1");
  }

  async fetchTables(): Promise<{ name: string; type: string; schema?: string }[]> {
    const [datasets] = await this.client.getDatasets();
    const promises = datasets.map(async dataset => {
      const [tables] = await dataset.getTables();
      return tables.map(table => ({
        schema: dataset.id ?? "",
        name: table.id ?? "",
        type: table.metadata.type.toLowerCase()
      }));
    });
    const results = await Promise.all(promises);
    console.log(results);
    return flatten(results);
  }

  async fetchTableSummary({
    schema,
    name
  }: {
    schema: string;
    name: string;
  }): Promise<{ name: string; defs: { fields: string[]; rows: (string | null)[][] }; schema?: string }> {
    const [metadata] = await this.client
      .dataset(schema)
      .table(name)
      .getMetadata();
    const schemaFields = metadata.schema.fields;
    const defs = {
      fields: Object.keys(schemaFields[0]),
      rows: schemaFields.map(Object.values)
    };
    return { schema, name, defs };
  }

  dataSourceInfo(): Record<string, any> {
    return {
      type: BigQuery.label,
      project: this.config.project
    };
  }
}
