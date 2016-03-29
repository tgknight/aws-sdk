from pyspark import SparkContext
from pyspark.sql import HiveContext

# def main():
sc = SparkContext()
hc = HiveContext(sc)

results = hc.sql("CREATE TABLE {{tableName}} ({{header}}) row format delimited fields terminated by '{{delimiter}}' lines terminated by '\n' STORED AS TEXTFILE LOCATION '{{location}}'").collect()

"""
if __name__ == "__main__":
    main()
"""
