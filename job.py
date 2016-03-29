from pyspark import SparkContext
from pyspark.sql import HiveContext
from gcloud import datastore
from oauth2client.client import GoogleCredentials
from pyspark.sql import DataFrameWriter
import json

def main():
    sc = SparkContext()
    hc = HiveContext(sc)

    df = hc.sql("""{{sql}}""")
    df_writer = DataFrameWriter(df)
    df_writer.saveAsTable(name='{{tableName}}',
                          format='json',
                          mode='overwrite',
                          path='s3://data/{{tableName}}')

if __name__ == "__main__":
    main()

